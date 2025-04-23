import type { BasePoolState } from "./BasePoolState";

export abstract class BasePoolMath<TPool extends BasePoolState> {
	abstract swapExactInput(
		pool: TPool,
		zeroToOne: boolean,
		amountIn: bigint,
	): bigint;

	abstract swapExactOutput(
		pool: TPool,
		zeroToOne: boolean,
		amountOut: bigint,
	): bigint;

	abstract spotPriceWithoutFee(pool: TPool, zeroToOne: boolean): number;
}
