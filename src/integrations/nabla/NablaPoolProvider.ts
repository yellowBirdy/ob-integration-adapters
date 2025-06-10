import {
  type WatchContractEventOnLogsParameter,
  type Address,
  type PublicClient,
  zeroAddress,
} from "viem";
import { BasePoolStateProvider } from "../../base/BasePoolProvider";
import { PORTAL_ADDRESS, QUOTE_API_URL, PRICE_FEED_ID_TO_ASSET as idToAsset, PRICE_SCALING_FACTOR, PLACEHOLDER_PRICE_FEED_UPDATE } from "./constants";
import type { NablaPoolState } from "./NablaPoolState";
import { erc20Abi } from "viem";
import { NablaPortalAbi } from "./abis/Portal";
import { NablaSwapPoolAbi } from "./abis/SwapPool";
import { NablaCurveAbi } from "./abis/NablaCurve";
import { OracleAbi } from "./abis/Oracle";
import { NablaEffectiveAbi } from "./abis/NablaEffectiveAbi";
import { AddressMap } from "../../helpers/AddressMap";
import type { AssetPrice, PriceFeedUpdate } from "./NablaTypes";
import { EventSource } from 'eventsource';
import { NablaRouterAbi } from "./abis/NablaRouter";


export class NablaPoolProvider extends BasePoolStateProvider<NablaPoolState> {
  // Combined ABI for all events we want to track
  readonly abi = NablaEffectiveAbi;

  poolToVirtualAddress = new AddressMap<Set<Address>>();
  assetToPool = new AddressMap<Address>();

  priceFeedUpdate: PriceFeedUpdate | null = null;
  priceFeedUpdateListener: EventSource | null = null;
  assetPrices: AddressMap<AssetPrice> = new AddressMap<AssetPrice>();

  oracleAddress: Address | null = null;

  async start() {
    await super.start();
    this.oracleAddress = await this.client.readContract({
      address: PORTAL_ADDRESS,
      abi: NablaPortalAbi,
      functionName: "oracleAdapter",
    }) as Address;
    this.priceFeedUpdate = PLACEHOLDER_PRICE_FEED_UPDATE;
  }

  /**
   * Fetch all available Nabla pools
   */
  async getAllPools(): Promise<NablaPoolState[]> {
    const results: NablaPoolState[] = [];
//TODO pool decimals, curves beta and c
    const {abi} = this;

      // 1. Get routers from portal
      const routers = await this.client.readContract({
        address: PORTAL_ADDRESS,
        abi: NablaPortalAbi,
        functionName: "getRouters",
      }) as Address[];

      const routerAssets = new AddressMap<Address[]>();
      const getRouterAssetsCalls: any[] = [];
      for (const router of routers) {
        getRouterAssetsCalls.push({
          address: PORTAL_ADDRESS,
          abi: NablaPortalAbi,
          functionName: "getRouterAssets",
          args: [router],
        });
      }
      await this.client.multicall({
        contracts: getRouterAssetsCalls,
      })
      .then(results => {
        results.forEach((assets, index) => {
          const router = routers[index];
          if (router) {
            routerAssets.set(router, assets.result as Address[]);
          }
        });
      });

      const routerPools = new AddressMap<Address[]>();
      
      for (const [router, assets] of routerAssets.entries()) {
        const getRouterPoolsCalls: any[] = [];
        for (const asset of assets) {
          getRouterPoolsCalls.push({
            address: router,
            abi: NablaRouterAbi,
            functionName: "poolByAsset",
            args: [asset],
          });
        }
        routerPools.set(router, (await this.client.multicall({
          contracts: getRouterPoolsCalls,
        })).flatMap(result => result.result as Address[]));
        
      }

      // 3. Get details for each swap pool
      for (const [router, pools] of routerPools.entries()) {
        const tokens = routerAssets.get(router);
        if (!tokens) {
          continue;
        }
  
        const getReservesCalls: any[] = [];
        for (const pool of pools) {
          getReservesCalls.push({
            address: pool,
            abi: NablaSwapPoolAbi,
            functionName: "reserve",
          });
        }
        const reserves = (await this.client.multicall({
          contracts: getReservesCalls,
        })).map(result => result.result as bigint);

        const getReserveWithSlippageCalls: any[] = [];
        for (const pool of pools) {
          getReserveWithSlippageCalls.push({
            address: pool,
            abi: NablaSwapPoolAbi,
            functionName: "reserveWithSlippage",
          });
        };
        const reservesWithSlippage = (await this.client.multicall({
          contracts: getReserveWithSlippageCalls,
        })).map(result => result.result as bigint);

        const getTotalLiabilitiesCalls: any[] = [];
        for (const pool of pools) {
          getTotalLiabilitiesCalls.push({
            address: pool,
            abi: NablaSwapPoolAbi,
            functionName: "totalLiabilities",
          });
        }
        const totalLiabilities = (await this.client.multicall({
          contracts: getTotalLiabilitiesCalls,
        })).map(result => result.result as bigint);

        const getFeesCalls: any[] = [];
        for (const pool of pools) {
          getFeesCalls.push({
            address: pool,
            abi: NablaSwapPoolAbi,
            functionName: "swapFees",
          });
        }
     
        const fees: bigint[] = [];
        const lpFees: bigint[] = [];
        const feeQueryResult = await this.client.multicall({
          contracts: getFeesCalls,
        })
      // ).map( result => (result.result as bigint[]).reduce((acc, fee) => acc + fee, 0n));

        for (const result of feeQueryResult) {
          const [lpFee, backstopFee, protocolFee] = result.result as bigint[];
          fees.push(backstopFee as bigint + (protocolFee as bigint));
          lpFees.push(lpFee as bigint);
        }
        const getCurveAddressCalls: any[] = pools.map(pool => ({
          address: pool,
          abi: NablaSwapPoolAbi,
          functionName: "slippageCurve",
        }))
        const curveAddresses = (await this.client.multicall({
          contracts: getCurveAddressCalls,
        })).map(result => result.result as bigint);
        
        const getCurveBetaCalls: any[] = [];
        const getCurveCCalls: any[] = [];
        for (const curve of curveAddresses) {
          getCurveBetaCalls.push({
            address: curve,
            abi: NablaCurveAbi,
            functionName: "beta",
          })
          getCurveCCalls.push({
            address: curve,
            abi: NablaCurveAbi,
            functionName: "c",
          })
        }
        const curveBetas = (await this.client.multicall({
          contracts: getCurveBetaCalls,
        })).map(result => result.result as bigint);
        const curveCs = (await this.client.multicall({
          contracts: getCurveCCalls,
        })).map(result => result.result as bigint);

        const getAssetDecimalsCalls: any[] = tokens.map(token => ({
          address: token,
          abi: erc20Abi,
          functionName: "decimals",
        }))
        const assetDecimals = (await this.client.multicall({
          contracts: getAssetDecimalsCalls,
        })).map(result => result.result as bigint);



        for (let i = 0; i < pools.length; i++) {
          this.assetToPool.set(tokens[i] as Address, pools[i] as Address);
          for (let j = i + 1; j < pools.length; j++) {

            const token0 = tokens[i] as Address;
            const token1 = tokens[j] as Address;
            const address = this.getPoolVirtualAddress([pools[i] as `0x${string}`, pools[j] as `0x${string}`]) as `0x${string}`;
            const reserve0 = reserves[i] as bigint;
            const reserve1 = reserves[j] as bigint;
            //TODO call antenna api to get price and reverse price and price update data
            const reserveWithSlippage0 = reservesWithSlippage[i] as bigint;
            const reserveWithSlippage1 = reservesWithSlippage[j] as bigint;
            const totalLiabilities0 = totalLiabilities[i] as bigint;
            const totalLiabilities1 = totalLiabilities[j] as bigint;
            const pool0 = pools[i] as Address;
            const pool1 = pools[j] as Address;
            const fee0 = fees[i] as bigint;
            const fee1 = fees[j] as bigint;
            const lpFee0 = lpFees[i] as bigint;
            const lpFee1 = lpFees[j] as bigint;
            const assetDecimals0 = Number(assetDecimals[i]);
            const assetDecimals1 = Number(assetDecimals[j]);
            const beta0 = curveBetas[i] as bigint;
            const beta1 = curveBetas[j] as bigint;
            const c0 = curveCs[i] as bigint;
            const c1 = curveCs[j] as bigint;
            results.push({
              token0,
              token1,
              address,
              reserve0,
              reserve1,
              reserveWithSlippage0,
              reserveWithSlippage1,
              router,
              pool0,
              pool1,
              fee0,
              fee1,
              lpFee0,
              lpFee1,
              totalLiabilities0,
              totalLiabilities1,
              assetDecimals0,
              assetDecimals1,
              beta0,
              beta1,
              c0,
              c1,
            } as NablaPoolState);
            if (!this.poolToVirtualAddress.has(pool0)) {
              this.poolToVirtualAddress.set(pool0, new Set([address]));
            } else {
              this.poolToVirtualAddress.get(pool0)?.add(address);
            }
            if (!this.poolToVirtualAddress.has(pool1)) {
              this.poolToVirtualAddress.set(pool1, new Set([address]));
            } else {
              this.poolToVirtualAddress.get(pool1)?.add(address);
          }
        }
      }
    }
    return results;
  }

  /**
   * Handle events from Nabla contracts to update pool state
   */
  async handleEvent(
    log: WatchContractEventOnLogsParameter<typeof this.abi>[number],
  ): Promise<void> {
    if (!log.address) {
      return;
    }

    try {
      switch (log.eventName) {
        // Price source events
        case "PriceFeedUpdate": {
          const args = log.args as {
            id: `0x${string}`;
            price: bigint;
            publishTime: bigint;
            _: bigint;
          };
          
          const assetPrice: AssetPrice = {
            price: args.price,
            publish_time: args.publishTime,
          }
          const asset = idToAsset[args.id];
          if (asset) {
            this.assetPrices.set(asset, assetPrice);
            this.updateOraclePricesForAsset(asset);
          }
          return;
        }
        // SwapPool events
        case "ReserveUpdated": {
          // Update pool states based on swap event
          console.log("Reserve updated event detected at swap pool:", log.address);
          const args = log.args as {
            newReserve: bigint;
            newReserveWithSlippage: bigint;
            newTotalLiabilities: bigint;
          };

          await this.updatePoolReserve(log.address, args.newReserve, args.newReserveWithSlippage, args.newTotalLiabilities);
          return;
        }
        case "SwapFeesSet": {
          // Update pool fees
          console.log("Swap fees set event detected at swap pool:", log.address);
          const args = log.args as {
            _: Address;
            lpFee: bigint;
            backstopFee: bigint;
            protocolFee: bigint;
          };
          await this.updatePoolFees(log.address, args.backstopFee + args.protocolFee, args.lpFee);
          return;
        }

        // Portal events
        case "AssetRegistered": {
          // New swap pool registered
          console.log("New swap pool registered:", log.address);
          // Fetch all pools to update the state
          await this.fetchPools();
          return;
        }
        case "AssetUnregistered": {
          // New swap pool registered
          console.log("New swap pool registered:", log.address);
          // Fetch all pools to update the state
          await this.fetchPools();
          return;
        }
        // PriceFeed events
        case "TokenRegistered": {
          // New price feed registered
          console.log("New price feed registered:", log.address);
          const args = log.args as {
            _: Address;
            token: Address;
            priceFeedId: `0x${string}`;
            assetName: string;
          };
          if (idToAsset[args.priceFeedId]) {
            console.log(`Updating price feed id for token: ${args.token}, old id: ${idToAsset[args.priceFeedId]}, new id: ${args.priceFeedId}`);
          } 
          idToAsset[args.priceFeedId] = args.token;
          console.log(`Price feed id set for token: ${args.token}, new id: ${args.priceFeedId}`);
          return;
        }
      }
    } catch (error) {
      console.error("Error handling event:", error);
    }
  }

  /**
   * Execute a swap using Nabla's NablaPortal
   */
  async swap(
    pool: NablaPoolState,
    amountIn: bigint,
    zeroToOne: boolean,
  ): Promise<void> {

    // Get the token addresses for the swap
    const tokenIn = zeroToOne ? pool.token0 : pool.token1;
    const tokenOut = zeroToOne ? pool.token1 : pool.token0;

    // Calculate the deadline (current time + 20 minutes)
    const now = Math.floor(Date.now() / 1000);
    const deadline = BigInt(now + 20 * 60);

    // Execute the swap via the NablaPortal
    await this.client.simulateContract({
      address: PORTAL_ADDRESS,
      abi: this.abi,
      functionName: "swapExactTokensForTokens",
      args: [
        amountIn,
        0n, // amountOutMin (0 for simulation)
        [tokenIn, tokenOut], // to address (would be set to actual recipient)
        [pool.router],
        pool.router,
        BigInt(Date.now()/1000 + 1000),
        pool.priceFeedUpdate,
      ],
    });
  }

  /**
   * Update the reserve for a specific pool
   */
  private async updatePoolReserve(poolAddress: Address, newReserve: bigint, newReserveWithSlippage: bigint, newTotalLiabilities: bigint): Promise<void> {
    try {
      const virtualAddress = this.poolToVirtualAddress.get(poolAddress);
      if (!virtualAddress) throw new Error("Pool not found");
      for (const address of virtualAddress) {
      const pool = this.pools.get(address);
      if (!pool) throw new Error("Virtual pool not found");
      if (pool.token0 === poolAddress) {
        pool.reserve0 = newReserve;
        pool.reserveWithSlippage0 = newReserveWithSlippage;
        pool.totalLiabilities0 = newTotalLiabilities;
      } else {
        pool.reserve1 = newReserve;
          pool.reserveWithSlippage1 = newReserveWithSlippage;
          pool.totalLiabilities1 = newTotalLiabilities;
        }
      }
    } catch (error) {
      console.error(`Error updating reserve for pool ${poolAddress}:`, error);
    }
  }

  /**
   * Update the fees for a specific pool
   */
  private async updatePoolFees(poolAddress: Address, newFees: bigint, newLpFees: bigint): Promise<void> {
    try {
      const virtualAddress = this.poolToVirtualAddress.get(poolAddress);
      if (!virtualAddress) throw new Error("Pool not found");
      for (const address of virtualAddress) {
      const pool = this.pools.get(address);
      if (!pool) throw new Error("Virtual pool not found");
      if (pool.token0 === poolAddress) {
        pool.fee0 = newFees;
        pool.lpFee0 = newLpFees;
      } else {
          pool.fee1 = newFees;
          pool.lpFee1 = newLpFees;
        }
      }
    } catch (error) {
      console.error(`Error updating fees for pool ${poolAddress}:`, error);
    }
  }

  /**
   * Update the imbalance for a specific swap pool
   */
  private async updateOraclePrice(virtualAddress: Address, price: bigint, reversedPrice: bigint, priceFeedUpdate: `0x${string}`[]): Promise<void> {
    
    try {
      const pool = this.pools.get(virtualAddress);
      if (!pool) throw new Error("Virtual pool not found");
      pool.oraclePrice = price;
      pool.reversedOraclePrice = reversedPrice;
      pool.priceFeedUpdate = priceFeedUpdate;
      
    } catch (error) {
      console.error(`Error updating oracle price for virtualpool ${virtualAddress}:`, error);
    }
  }

  private updateOraclePricesForAsset(asset: Address): void {
    const assetPrice = this.assetPrices.get(asset);
    if (!assetPrice) {
      return;
    } 
    const price = assetPrice.price;

    for (const [asset1, price1] of this.assetPrices.entries()) {
      if (asset1 === asset) {
        continue;
      }
      const virtualAddress = this.getPoolVirtualAddress([this.assetToPool.get(asset) as Address, this.assetToPool.get(asset1) as Address]);
      const pool = this.pools.get(virtualAddress);
      if (!pool) {
        continue;
      }
      const pairPrice = BigInt(price) * PRICE_SCALING_FACTOR / BigInt(price1.price);
      const reversedPairPrice = BigInt(price1.price) * PRICE_SCALING_FACTOR / BigInt(price);

      this.updateOraclePrice(virtualAddress, pairPrice, reversedPairPrice, this.priceFeedUpdate?.binary.data || []);
    }
    
  }

  private updateAllOraclePrices(): void {
    for (const [asset0, price0] of this.assetPrices.entries()) {
      for (const [asset1, price1] of this.assetPrices.entries()) {
        if (asset0 === asset1) {  
          continue;
        }
        const virtualAddress = this.getPoolVirtualAddress([this.assetToPool.get(asset0) as Address, this.assetToPool.get(asset1) as Address]);
        const pool = this.pools.get(virtualAddress);
        if (!pool) {
          continue;
        }
        const pairPrice = BigInt(price0.price) * PRICE_SCALING_FACTOR / BigInt(price1.price);
        const reversedPairPrice = BigInt(price1.price) * PRICE_SCALING_FACTOR / BigInt(price0.price);

        this.updateOraclePrice(virtualAddress, pairPrice, reversedPairPrice, this.priceFeedUpdate?.binary.data || []);
      }
    }
  }

  /**
   * HELPERS
   */
  getPoolVirtualAddress(poolAddresses: `0x${string}`[]): `0x${string}` {
      return `0x${poolAddresses[0]?.substring(2,22)}${poolAddresses[1]?.substring(22)}`;
  }

} 
