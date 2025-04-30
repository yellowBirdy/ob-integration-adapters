import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import {
	type Address,
	type WatchContractEventOnLogsParameter,
	zeroAddress,
} from "viem";
import { BasePoolStateProvider } from "../../base/BasePoolProvider";
import type { BrownFiPoolState } from "./BrownFiPoolState";
import { FactoryAbi } from "./abis/Factory";
import { PairAbi } from "./abis/Pair";
import { PythAbi } from "./abis/Pyth";
import { RouterAbi } from "./abis/Router";
import {
	FACTORY_ADDRESS,
	PRICE_FEED_IDS,
	PYTH_ADDRESS,
	ROUTER_ADDRESS,
	WETH,
} from "./constants";

export class BrownFiPoolProvider extends BasePoolStateProvider<BrownFiPoolState> {
	readonly abi = [...FactoryAbi, ...PairAbi];
	poolAddresses = new Array<Address>();

	async getAllPools(): Promise<BrownFiPoolState[]> {
		// TODO replace by api
		const allPairLength = (await this.client.readContract({
			address: FACTORY_ADDRESS,
			abi: this.abi,
			functionName: "allPairsLength",
			args: [],
		})) as bigint;

		const pairs: BrownFiPoolState[] = [];

		for (let i = 0n; i < allPairLength; i += 1n) {
			const poolAddress = (await this.client.readContract({
				address: FACTORY_ADDRESS,
				abi: this.abi,
				functionName: "allPairs",
				args: [i],
			})) as Address;

			const poolState = await this.getPool(poolAddress);
			pairs.push(poolState);

			this.poolAddresses = [...this.poolAddresses, poolAddress];
		}

		// update price update fee metrics each block
		this.client.watchBlockNumber({
			onBlockNumber: (_) => {
				for (const pool of this.poolAddresses) {
					this.updatePoolUpdateFee(pool);
				}
			},
		});

		return pairs;
	}

	async getPool(pool: Address): Promise<BrownFiPoolState> {
		const [
			token0,
			token1,
			reserves,
			kappa,
			fee,
			oraclePrice,
			decimalShift,
			qti,
		] = await this.client.multicall({
			contracts: [
				{
					address: pool,
					abi: this.abi,
					functionName: "token0",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "token1",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "getReserves",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "kappa",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "fee",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "fetchOraclePrice",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "decimalShift",
				},
				{
					address: pool,
					abi: this.abi,
					functionName: "qti",
				},
			],
		});

		return {
			token0: (token0.result as Address) ?? zeroAddress,
			token1: (token1.result as Address) ?? zeroAddress,
			address: pool,
			reserve0:
				(reserves as { result: bigint[] | undefined }).result?.[0] ?? 0n,
			reserve1:
				(reserves as { result: bigint[] | undefined }).result?.[1] ?? 0n,
			kappa: (kappa.result as bigint) ?? 0n,
			fee: (fee.result as bigint) ?? 0n,
			oraclePrice: (oraclePrice.result as bigint) ?? 0n,
			decimalShift: (decimalShift.result as bigint) ?? 0n,
			qti: (qti.result as bigint) ?? 0n,
			updateFee: 0n,
			updateFeeData: [],
		};
	}

	async swap(
		pool: BrownFiPoolState,
		amountIn: bigint,
		zeroToOne: boolean,
	): Promise<void> {
		// check is weth pool
		const isWETH = pool.token0 === WETH || pool.token1 === WETH;

		const swapPath = zeroToOne
			? [pool.token0, pool.token1]
			: [pool.token1, pool.token0];

		const amountOutMin = 0n;
		const to = zeroAddress;

		const latestBlock = await this.client.getBlock();
		const deadline = latestBlock.timestamp + 900n; // 15 minutes from latest block

		await this.client.simulateContract({
			address: ROUTER_ADDRESS,
			abi: RouterAbi,
			functionName: isWETH
				? "swapETHForExactTokensWithPrice"
				: "swapExactTokensForTokensWithPrice",
			args: isWETH
				? [amountOutMin, swapPath, to, deadline, pool.updateFeeData]
				: [amountIn, amountOutMin, swapPath, to, deadline, pool.updateFeeData],
			value: isWETH ? amountIn + pool.updateFee : pool.updateFee,
		});
	}

	async handleEvent(
		log: WatchContractEventOnLogsParameter<typeof this.abi>[number],
	): Promise<void> {
		if (!log.address) {
			return;
		}

		switch (log.eventName) {
			case "PairCreated": {
				const args = log.args as {
					token0: Address;
					token1: Address;
					pair: Address;
				};
				const poolState = await this.getPool(args.pair);
				this.pools.set(args.pair, poolState);
				return;
			}
			case "Sync": {
				const args = log.args as {
					reserve0: bigint;
					reserve1: bigint;
				};
				const poolState = this.pools.get(log.address);
				if (!poolState) return;
				poolState.reserve0 = args.reserve0;
				poolState.reserve1 = args.reserve1;
				this.pools.set(log.address, poolState);
				return;
			}
		}
	}

	async updatePoolUpdateFee(poolAddress: Address) {
		const pool = this.pools.get(poolAddress);
		if (!pool) return;

		const priceFeedIds: string[] = [];
		if (PRICE_FEED_IDS[pool.token0]) {
			priceFeedIds.push(PRICE_FEED_IDS[pool.token0] as string);
		}
		if (PRICE_FEED_IDS[pool.token1]) {
			priceFeedIds.push(PRICE_FEED_IDS[pool.token1] as string);
		}

		if (!priceFeedIds.length) return;

		// Create connection to Pyth price service
		const pythConn = new EvmPriceServiceConnection(
			"https://hermes.pyth.network",
		);
		// Get price feed update data
		const priceFeedUpdateData = (await pythConn.getPriceFeedsUpdateData(
			priceFeedIds,
		)) as `0x${string}`[];

		const updateFee = await this.client.readContract({
			address: PYTH_ADDRESS,
			abi: PythAbi,
			functionName: "getUpdateFee",
			args: [priceFeedUpdateData],
		});

		pool.updateFee = updateFee;
		pool.updateFeeData = priceFeedUpdateData;

		this.pools.set(poolAddress, pool);
	}
}
