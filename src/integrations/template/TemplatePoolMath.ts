import { BasePoolMath } from "../../base/PoolMath";
import type { TemplateBasePoolState } from "./TemplateBasePoolState";

export class TemplatePoolMath extends BasePoolMath<TemplateBasePoolState> {
	override swapExactInput(
		pool: TemplateBasePoolState,
		token0ToToken1: boolean,
		amountIn: bigint,
	): bigint {
		return amountIn;
	}

	override swapExactOutput(
		pool: TemplateBasePoolState,
		token0ToToken1: boolean,
		amountOut: bigint,
	): bigint {
		return amountOut;
	}

	override spotPriceWithoutFee(
		pool: TemplateBasePoolState,
		token0ToToken1: boolean,
	): number {
		return 1;
	}
}
