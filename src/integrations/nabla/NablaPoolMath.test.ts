import { describe, expect, test } from "bun:test";
import { parseEther, parseUnits, zeroAddress } from "viem";
import { NablaPoolMath } from "./NablaPoolMath";
import  NablaCurve  from "./NablaCurve";
import type { NablaPoolState } from "./NablaPoolState";


describe("Nabla slippage curve", () => {
  test("inverse horizontal", () => {
    const curveIn = new NablaCurve(5000000000000000n, 17075887234393789126n);
    const reserveIn = 1000000000000000000000n
    const totalLiabilitiesIn = 1000000000000000000000n
    const reserveWithSlippageIn = 1000000000000000000000n
    const amountIn = 100000000000000000000n
    const decimalsIn = 18
    const effectiveAmountIn = curveIn.inverseHorizontal(reserveIn, totalLiabilitiesIn, reserveWithSlippageIn + amountIn, BigInt(decimalsIn));
    expect(effectiveAmountIn).toBe(99997249253573525485n);

  });
  
});

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


  const imbalancedPoolReal = {
    ...basePoolState,
      reserve0:1099997249253573525485n,
      reserveWithSlippage0: parseEther("1100"),
      reserve1: 900052749371053261277n,
      reserveWithSlippage1: 900055528992381704580n,
      totalLiabilities1: 1000019999449850714705n,
  };

  const imbalancedPoolRealDifferentOraclePrice = {
    ...imbalancedPoolReal,
    oraclePrice: parseUnits("2", 12),
    reversedOraclePrice: parseUnits("0.5", 12),
  };
  

  test("swapExactInput zeroToOne with base pool", () => {
    const amountIn = parseEther("1");
    const amountOut = poolMath.swapExactInput(basePoolState, true, amountIn);
  
    // Magic number from the real pool
    const expectedAmountOut = 999499447081423335n;
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput oneToZero with base pool", () => {
    const amountIn = parseEther("10");
    const amountOut = poolMath.swapExactInput(basePoolState, false, amountIn);

    // Magic number from the real pool
    const expectedAmountOut = 9994944708456040182n;
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput zeroToOne with real imbalanced ", () => {
    const amountIn = parseEther("1");
    const amountOut = poolMath.swapExactInput(imbalancedPoolReal, true, amountIn);
    
    // Magic number from the real pool
    const expectedAmountOut = 999388867509266416n; 
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput oneToZero with real imbalanced ", () => {
    const amountIn = parseEther("100");
    const amountOut = poolMath.swapExactInput(imbalancedPoolReal, false, amountIn);
    
    // Magic number from the real pool
    const expectedAmountOut = 99955528977429623139n;   
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput zeroToOne with real imbalanced different oracle price", () => {
    let amountIn = parseEther("1");
    let amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, true, amountIn);
    
    // Magic number from the real pool
    let expectedAmountOut = 1998777172854114531n; 
    expect(amountOut).toBe(expectedAmountOut);


    amountIn = parseEther("294.1103");
    amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, true, amountIn);
    
    // Magic number from the real pool
    expectedAmountOut = 587714666553705261983n; 
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput oneToZero with real imbalanced different oracle price", () => {
    let amountIn = parseEther("100");
    let amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, false, amountIn);
    
    // Magic number from the real pool
    let expectedAmountOut = 49978449948289449651n;   
    expect(amountOut).toBe(expectedAmountOut);


    amountIn = parseEther("73.248");
    amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, false, amountIn);
  
  // Magic number from the real pool
    expectedAmountOut = 36608621679774251009n;   
    expect(amountOut).toBe(expectedAmountOut);
  });


  test("spotPriceWithoutFee zeroToOne with base pool", () => {
    const price = poolMath.spotPriceWithoutFee(basePoolState, true);
    expect(price).toBe(1); // Oracle price is 1e10 so price should be 1
  });

  test("spotPriceWithoutFee oneToZero with base pool", () => {
    const price = poolMath.spotPriceWithoutFee(basePoolState, false);
    expect(price).toBe(1); // Oracle price is 1e10 so price should be 1
  });

  test("spotPriceWithoutFee zeroToOne with imbalanced pool", () => {
    const price = poolMath.spotPriceWithoutFee(imbalancedPoolRealDifferentOraclePrice, true);
    expect(price).toBe(2); // Oracle price is 1e10 so price should be 1
  });

  test("spotPriceWithoutFee oneToZero with imbalanced pool", () => {
    const price = poolMath.spotPriceWithoutFee(imbalancedPoolRealDifferentOraclePrice, false);
    expect(price).toBe(0.5); // Oracle price is 1e10 so price should be 1
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