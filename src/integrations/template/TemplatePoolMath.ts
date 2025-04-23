import { BasePoolMath } from "../../base/BasePoolMath";
import type { TemplateBasePoolState } from "./TemplateBasePoolState";

export class TemplatePoolMath extends BasePoolMath<TemplateBasePoolState> {
	override swapExactInput(
		pool: TemplateBasePoolState,
		zeroToOne: boolean,
		amountIn: bigint,
	): bigint {
		return amountIn;
	}

	override swapExactOutput(
		pool: TemplateBasePoolState,
		zeroToOne: boolean,
		amountOut: bigint,
	): bigint {
		return amountOut;
	}

	override spotPriceWithoutFee(
		pool: TemplateBasePoolState,
		zeroToOne: boolean,
	): number {
		return 1;
	}
}
