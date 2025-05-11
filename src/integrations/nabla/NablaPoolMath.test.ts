import { describe, expect, test } from "bun:test";
import { parseEther, parseUnits, zeroAddress } from "viem";
import { NablaPoolMath } from "./NablaPoolMath";
import type { NablaPoolState } from "./NablaPoolState";
import { PRICE_SCALING_FACTOR } from "./constants";

describe("NablaPoolMath", () => {
  const poolMath = new NablaPoolMath();
  
  // Basic pool with no imbalance
  const basePoolState = {
    token0: zeroAddress,
    token1: zeroAddress,
    address: zeroAddress,
    reserve0: parseEther("1000"),
    reserve1: parseEther("1000"),
    fee: 0n, // 0.3%
    oraclePrice: parseUnits("1", 12), // 1:1 price
    reversedOraclePrice: parseUnits("1", 12), // 1:1 price
    reserveWithSlippage0: parseEther("1000"),
    reserveWithSlippage1: parseEther("1000"),
    totalLiabilities0: parseEther("1000"),
    totalLiabilities1: parseEther("1000"),
    router: zeroAddress,
    pool0: zeroAddress,
    pool1: zeroAddress,
    fee0: 300n, // 3 BP
    fee1: 300n, // 3 BP
    lpFee0: 200n,
    lpFee1: 200n,
    priceFeedUpdate: ["0x0000000000000000000000000000000000000000"],
    beta0: 5000000000000000n,
    beta1: 5000000000000000n,
    c0: 17075887234393789126n,
    c1: 17075887234393789126n,
    assetDecimals0: 18,
    assetDecimals1: 18,
  } as NablaPoolState;
  // Pool with imbalance
  // TODO: input real amounts
  const imbalancedTokenInPoolStateOver = {
    ...basePoolState,
    reserve0: parseEther("110"),
    reservWithSlippage0: parseEther("111")
  };
  const imbalancedTokenInPoolStateUnder = {
    ...basePoolState,
    reserve0: parseEther("90"),
    reservWithSlippage0: parseEther("91")
  };
  const imbalancedTokenOutPoolStateOver = {
    ...basePoolState,
    reserve0: parseEther("110"),
    reservWithSlippage0: parseEther("111")
  };
  const imbalancedTokenOutPoolStateUnder = {
    ...basePoolState,
    reserve0: parseEther("90"),
    reservWithSlippage0: parseEther("91")
  };

  test("swapExactInput zeroToOne with base pool", () => {
    const amountIn = parseEther("1");
    const amountOut = poolMath.swapExactInput(basePoolState, true, amountIn);
    
    const expectedAmountOut = (amountIn * 9995n / 10000n) * basePoolState.oraclePrice! / PRICE_SCALING_FACTOR;
    expect(Number(amountOut)).toBeCloseTo(Number(expectedAmountOut), -16);
  });

  test("swapExactInput oneToZero with base pool", () => {
    const amountIn = parseEther("10");
    const amountOut = poolMath.swapExactInput(basePoolState, false, amountIn);
    
    // Expected: amountIn * (1 - fee) * Q96 / oraclePrice
    const expectedAmountOut = (amountIn * 9970n / 10000n) * Q96 / basePoolState.oraclePrice!;
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput zeroToOne with imbalanced pool", () => {
    const amountIn = parseEther("10");
    const amountOut = poolMath.swapExactInput(imbalancedPoolState, true, amountIn);
    
    // Base amount: amountIn * (1 - fee) * oraclePrice / Q96
    const baseAmount = (amountIn * 9970n / 10000n) * imbalancedPoolState.oraclePrice! / Q96;
    
    // Apply imbalance: baseAmount * (1 - (Q96 - imbalance) / Q96)
    const imbalanceAdjustment = baseAmount * (Q96 - imbalancedPoolState.imbalance!) / Q96;
    const expectedAmountOut = baseAmount - imbalanceAdjustment;
    
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactOutput zeroToOne with base pool", () => {
    const amountOut = parseEther("10");
    const amountIn = poolMath.swapExactOutput(basePoolState, true, amountOut);
    
    // Expected: amountOut * Q96 / oraclePrice * (1 / (1 - fee))
    const expectedAmountIn = amountOut * Q96 / basePoolState.oraclePrice! * 10000n / 9970n;
    expect(amountIn).toBe(expectedAmountIn);
  });

  test("swapExactOutput oneToZero with base pool", () => {
    const amountOut = parseEther("10");
    const amountIn = poolMath.swapExactOutput(basePoolState, false, amountOut);
    
    // Expected: amountOut * oraclePrice / Q96 * (1 / (1 - fee))
    const expectedAmountIn = amountOut * basePoolState.oraclePrice! / Q96 * 10000n / 9970n;
    expect(amountIn).toBe(expectedAmountIn);
  });

  test("spotPriceWithoutFee zeroToOne with base pool", () => {
    const price = poolMath.spotPriceWithoutFee(basePoolState, true);
    // Expected: oraclePrice / Q96 (as number)
    const expectedPrice = Number(basePoolState.oraclePrice!) / Number(Q96);
    expect(price).toBe(expectedPrice);
  });

  test("spotPriceWithoutFee oneToZero with base pool", () => {
    const price = poolMath.spotPriceWithoutFee(basePoolState, false);
    // Expected: Q96 / oraclePrice (as number)
    const expectedPrice = Number(Q96) / Number(basePoolState.oraclePrice!);
    expect(price).toBe(expectedPrice);
  });

  test("spotPriceWithoutFee zeroToOne with imbalanced pool", () => {
    const price = poolMath.spotPriceWithoutFee(imbalancedPoolState, true);
    // Expected: (oraclePrice / Q96) * (1 - imbalance/Q96) (as number)
    const basePrice = Number(imbalancedPoolState.oraclePrice!) / Number(Q96);
    const imbalanceFactor = Number(imbalancedPoolState.imbalance!) / Number(Q96);
    const expectedPrice = basePrice * (1 - imbalanceFactor);
    
    expect(price).toBeCloseTo(expectedPrice, 10);
  });

  test("throws error when pool missing required data", () => {
    const invalidPool = {
      ...basePoolState,
      oraclePrice: undefined,
    };
    
    expect(() => poolMath.swapExactInput(invalidPool, true, parseEther("10"))).toThrow();
    expect(() => poolMath.swapExactOutput(invalidPool, true, parseEther("10"))).toThrow();
    expect(() => poolMath.spotPriceWithoutFee(invalidPool, true)).toThrow();
  });
}); 