import type { BasePoolState } from "../../base/BasePoolState";

export interface BrownFiPoolState extends BasePoolState {
	kappa: bigint;
	fee: bigint;
	oraclePrice: bigint;
	decimalShift: bigint;
	qti: bigint;
	updateFee: bigint;
	updateFeeData: `0x${string}`[];
}
