import { BasePoolMath } from "../../base/BasePoolMath";
import type { NablaPoolState } from "./NablaPoolState";
import  NablaCurve  from "./NablaCurve";

export class NablaPoolMath extends BasePoolMath<NablaPoolState> {
  // Scaling factor for precision calculations
  private readonly Q96 = 2n ** 96n;
  
  /**
   * Calculate the amount of tokens received for an exact input amount
   * 
   * @param pool The pool state
   * @param zeroToOne Direction of swap (true for token0 to token1, false for token1 to token0)
   * @param amountIn Exact amount of tokens to swap
   * @returns Expected amount of output tokens
   */
  override swapExactInput(
    pool: NablaPoolState,
    zeroToOne: boolean,
    amountIn: bigint,
  ): bigint {
    if (!pool.oraclePrice || !pool.reversedOraclePrice) {
      throw new Error("Pool missing required price or fee data");
    }

    // For initial implementation, use a simplified model based on oracle price
    // This will be replaced with the actual Nabla math formula
    let amountOut: bigint;
    let feeAmount: bigint;

    if (zeroToOne) {
      // token0 to token1: multiply by oracle price
      const curveIn = new NablaCurve(pool.beta0, pool.c0);
      const curveOut = new NablaCurve(pool.beta1, pool.c1);


      const effectiveAmountIn = curveIn.inverseHorizontal(pool.reserve0, pool.totalLiabilities0, pool.reserveWithSlippage0 + amountIn, pool.assetDecimals0);
      
      
      amountOut = (amountIn * pool.oraclePrice) / BigInt(1e10);
    
      // Apply fee
      feeAmount = 0n;// (amountIn * pool.fee1) / 10000n;
      amountOut = amountOut - feeAmount;
    } else {
      // token1 to token0: divide by oracle price
      
      amountOut = (amountIn * pool.reversedOraclePrice) / BigInt(1e10);

      // Apply fee
      feeAmount = 0n;// (amountIn * pool.fee1) / 10000n;
      amountOut = amountOut - feeAmount;
    }

    // Adjust for imbalance if present
    if (pool.reserveWithSlippage0 !== pool.reserve0 || pool.reserveWithSlippage1 !== pool.reserve1) {
      // Simplified imbalance adjustment - will be replaced with actual formula
    }

    return amountOut;
  }

  /**
   * Calculate the amount of input tokens needed for an exact output amount
   * 
   * @param pool The pool state
   * @param zeroToOne Direction of swap (true for token0 to token1, false for token1 to token0)
   * @param amountOut Exact amount of output tokens desired
   * @returns Required amount of input tokens
   */
  override swapExactOutput(
    pool: NablaPoolState,
    zeroToOne: boolean,
    amountOut: bigint,
  ): bigint {
    throw new Error("Not implemented");
  }

  /**
   * Calculate the spot price without considering the fee
   * 
   * @param pool The pool state
   * @param zeroToOne Direction (true for token0 to token1, false for token1 to token0)
   * @returns Spot price as a number
   */
  override spotPriceWithoutFee(
    pool: NablaPoolState,
    zeroToOne: boolean,
  ): number {
    if (!pool.oraclePrice || !pool.reversedOraclePrice) {
      throw new Error("Pool missing required price data");
    }
    // Without imbalance, just return the oracle price
    return zeroToOne ? Number(pool.oraclePrice) / 1e10 : Number(pool.reversedOraclePrice) / 1e10;
  }

} 