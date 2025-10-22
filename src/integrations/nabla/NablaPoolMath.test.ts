import { describe, expect, test } from "bun:test";
import { parseEther, parseUnits, zeroAddress } from "viem";
import { NablaPoolMath } from "./NablaPoolMath";
import  NablaCurve  from "./NablaCurve";
import type { NablaPoolState } from "./NablaPoolState";


describe("Nabla slippage curve", () => {

  test("log2", () => {
    const curveIn = new NablaCurve(5000000000000000n, 17075887234393789126n);
    const log2 = curveIn.log2(326774213602733821881292424000000000000000000n);
    const log2r = curveIn.log2(326737699310520346427257904000000000000000000n);
    
    console.log("log2", log2);
    console.log("log2r", log2r);
  });

  test("sqrt", () => {
    const curveIn = new NablaCurve(5000000000000000n, 17075887234393789126n);
    const sqrt = curveIn.sqrt(326774213602733821881292424n);
    const sqrtr = curveIn.sqrt(326737699310520346427257904n);
    console.log("sqrt", sqrt);
    console.log("sqrtr", sqrtr);
  });

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
    pricePublishTime: BigInt(Date.now() - 1),
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
    protocolFee0: 100n,
    protocolFee1: 100n,
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
    const expectedAmountOut = 999399447164390453n;
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput oneToZero with base pool", () => {
    const amountIn = parseEther("10");
    const amountOut = poolMath.swapExactInput(basePoolState, false, amountIn);

    // Magic number from the real pool
    const expectedAmountOut = 9993944716755456354n;
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput zeroToOne with real imbalanced ", () => {
    const amountIn = parseEther("1");
    const amountOut = poolMath.swapExactInput(imbalancedPoolReal, true, amountIn);
    
    // Magic number from the real pool
    const expectedAmountOut = 999288878655122808n; 
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput oneToZero with real imbalanced ", () => {
    const amountIn = parseEther("100");
    const amountOut = poolMath.swapExactInput(imbalancedPoolReal, false, amountIn);
    
    // Magic number from the real pool
    const expectedAmountOut = 99945528699304486120n;   
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput zeroToOne with real imbalanced different oracle price", () => {
    let amountIn = parseEther("1");
    let amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, true, amountIn);
    
    // Magic number from the real pool
    let expectedAmountOut = 1998577195258299942n; 
    
    expect(amountOut).toBe(expectedAmountOut);


    amountIn = parseEther("294.1103");
    amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, true, amountIn);
    
    // Magic number from the real pool
    expectedAmountOut =   587655876076133933446n; 
    expect(amountOut).toBe(expectedAmountOut);
  });

  test("swapExactInput oneToZero with real imbalanced different oracle price", () => {
    let amountIn = parseEther("100");
    let amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, false, amountIn);
    
    // Magic number from the real pool
    let expectedAmountOut = 49973449671535241267n;   
    expect(amountOut).toBe(expectedAmountOut);


    amountIn = parseEther("73.248");
    amountOut = poolMath.swapExactInput(imbalancedPoolRealDifferentOraclePrice, false, amountIn);
  
  // Magic number from the real pool
    expectedAmountOut = 36604959022922925425n;   
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

  test("throws error when amount out exceeds reserve", () => {
    const amountIn = parseEther("950");
    expect(poolMath.swapExactInput(imbalancedPoolReal, true, amountIn )).toBe(0n);
  });

  test("throws error when pool price is too old", () => {
    const pool = {
      ...basePoolState,
      pricePublishTime: BigInt(Date.now() - 5000),
    } as NablaPoolState;
    expect(() => poolMath.swapExactInput(pool, true, parseEther("10"))).toThrow();
  });
}); 