import type { BasePoolState } from "./BasePoolState";

export abstract class BasePoolMath<TPool extends BasePoolState> {
	abstract swapExactInput(
		pool: TPool,
		token0ToToken1: boolean,
		amountIn: bigint,
	): bigint;

	abstract swapExactOutput(
		pool: TPool,
		token0ToToken1: boolean,
		amountOut: bigint,
	): bigint;

	abstract spotPriceWithoutFee(pool: TPool, token0ToToken1: boolean): number;
}
