import type { Address } from "viem";

export interface BasePoolState {
	token0: Address;
	token1: Address;
	address: Address;
	reserve0: bigint;
	reserve1: bigint;
}
