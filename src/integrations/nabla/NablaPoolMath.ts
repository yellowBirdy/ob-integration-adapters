import { BasePoolMath } from "../../base/BasePoolMath";
import type { NablaPoolState } from "./NablaPoolState";
import  NablaCurve  from "./NablaCurve";
import { PRICE_SCALING_FACTOR, FEE_PRECISION } from "./constants";
export class NablaPoolMath extends BasePoolMath<NablaPoolState> {
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

    const {
      oraclePrice, reversedOraclePrice, assetDecimals0, assetDecimals1, 
      reserve0, reserve1, reserveWithSlippage0, reserveWithSlippage1, 
      totalLiabilities0, totalLiabilities1, fee0, fee1, lpFee0, lpFee1
    } = pool;

    // intiaize by direction
    const curveIn = zeroToOne ? new NablaCurve(pool.beta0, pool.c0) : new NablaCurve(pool.beta1, pool.c1);
    const curveOut = zeroToOne ? new NablaCurve(pool.beta1, pool.c1) : new NablaCurve(pool.beta0, pool.c0);
    const reserveIn = zeroToOne ? reserve0 : reserve1;
    const reserveOut = zeroToOne ? reserve1 : reserve0;
    const totalLiabilitiesIn = zeroToOne ? totalLiabilities0 : totalLiabilities1;
    const totalLiabilitiesOut = zeroToOne ? totalLiabilities1 : totalLiabilities0;

    const reserveWithSlippageIn = zeroToOne ? reserveWithSlippage0 : reserveWithSlippage1;
    const reserveWithSlippageOut = zeroToOne ? reserveWithSlippage1 : reserveWithSlippage0;
    const decimalsIn = zeroToOne ? assetDecimals0 : assetDecimals1;
    const decimalsOut = zeroToOne ? assetDecimals1 : assetDecimals0;

    const fee = zeroToOne ? fee1 : fee0;
    const lpFee = zeroToOne ? lpFee1 : lpFee0;

    const price = zeroToOne ? oraclePrice : reversedOraclePrice;

    // COMPUTE
    // ADJUST FOR IN TOKEN POOL IMBALANCE
    const effectiveAmountIn = curveIn.inverseHorizontal(reserveIn, totalLiabilitiesIn, reserveWithSlippageIn + amountIn, BigInt(decimalsIn));

    // AMOUNT OUT BEFORE FEES AND OUT TOKEN POOL IMBALANCE
    let scalingFactor;
    if (decimalsIn > decimalsOut) {
      scalingFactor = PRICE_SCALING_FACTOR * BigInt(10 ** (decimalsIn - decimalsOut));
    } else {
      scalingFactor = PRICE_SCALING_FACTOR / BigInt(10 ** (decimalsOut - decimalsIn));
    }
    const rawAmountOut = effectiveAmountIn * price / scalingFactor;

    // COMPUTE FEES
    const feeAmount = rawAmountOut * fee / FEE_PRECISION;
    const maxLpFee = rawAmountOut * lpFee / FEE_PRECISION;

    // ADJUST FOR OUT TOKEN POOL IMBALANCE

    // COMPUTE ACTUAL LP FEE
    const reducedReserveOut = reserveOut - rawAmountOut + feeAmount;

    let actualLpFeeAmount = curveOut.inverseDiagonal(
      reducedReserveOut, totalLiabilitiesOut, reserveWithSlippageOut, BigInt(decimalsOut)
    );
    actualLpFeeAmount = actualLpFeeAmount > maxLpFee ? maxLpFee : actualLpFeeAmount;
   
    // COMPUTE ACTUAL REDUCED RESERVE AND TOTAL LIABILITIES
    const actualReducedReserveOut = reducedReserveOut + actualLpFeeAmount;
    const actualTotalLiabilitiesOut = totalLiabilitiesOut + actualLpFeeAmount;

    // COMPUTE EFFECTIVE RESERVE WITH SLIPPAGE AFTER AMOUNT OUT
    let reserveWithSlippageAfterAmountOut = curveOut.psi(
      actualReducedReserveOut, actualTotalLiabilitiesOut, BigInt(decimalsOut)
    );

    // COMPUTE ACTUAL AMOUNT OUT
    if (reserveWithSlippageAfterAmountOut > reserveWithSlippageOut) {
      reserveWithSlippageAfterAmountOut = reserveWithSlippageOut;
    }
    amountOut = reserveWithSlippageOut - reserveWithSlippageAfterAmountOut;

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