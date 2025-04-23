import { describe, expect, test } from "bun:test";
import { parseEther, zeroAddress } from "viem";
import { TemplatePoolMath } from "./TemplatePoolMath";

describe("TemplatePoolMath", () => {
	const poolMath = new TemplatePoolMath();
	const poolState = {
		address: zeroAddress,
		token0: zeroAddress,
		token1: zeroAddress,
		reserve0: 0n,
		reserve1: 0n,
	};

	test("swapExactInput zeroToOne", () => {
		expect(poolMath.swapExactInput(poolState, true, parseEther("1"))).toBe(
			parseEther("1"),
		);
	});

	test("swapExactInput oneToZero", () => {
		expect(poolMath.swapExactInput(poolState, false, parseEther("1"))).toBe(
			parseEther("1"),
		);
	});

	test("swapExactOutput zeroToOne", () => {
		expect(poolMath.swapExactOutput(poolState, true, parseEther("1"))).toBe(
			parseEther("1"),
		);
	});

	test("swapExactOutput oneToZero", () => {
		expect(poolMath.swapExactOutput(poolState, false, parseEther("1"))).toBe(
			parseEther("1"),
		);
	});

	test("spotPriceWithoutFee zeroToOne", () => {
		expect(poolMath.spotPriceWithoutFee(poolState, true)).toBe(1);
	});

	test("spotPriceWithoutFee oneToZero", () => {
		expect(poolMath.spotPriceWithoutFee(poolState, false)).toBe(1);
	});
});
