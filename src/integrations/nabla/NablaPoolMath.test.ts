import { describe, expect, test } from "bun:test";
import { parseEther, zeroAddress } from "viem";
import { NablaPoolMath } from "./NablaPoolMath";
import { Q96 } from "./constants";

describe("NablaPoolMath", () => {
  const poolMath = new NablaPoolMath();
  
  // Basic pool with no imbalance
  const basePoolState = {
    address: zeroAddress,
    token0: zeroAddress,
    token1: zeroAddress,
    reserve0: parseEther("100"),
    reserve1: parseEther("200"),
    isSwapPool: true,
    fee: 30n, // 0.3%
    oraclePrice: Q96, // 1:1 price
  };

  // Pool with imbalance
  const imbalancedPoolState = {
    ...basePoolState,
    imbalance: Q96 / 10n, // 10% imbalance
  };

  test("swapExactInput zeroToOne with base pool", () => {
    const amountIn = parseEther("10");
    const amountOut = poolMath.swapExactInput(basePoolState, true, amountIn);
    
    // Expected: amountIn * (1 - fee) * oraclePrice / Q96
    const expectedAmountOut = (amountIn * 9970n / 10000n) * basePoolState.oraclePrice! / Q96;
    expect(amountOut).toBe(expectedAmountOut);
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