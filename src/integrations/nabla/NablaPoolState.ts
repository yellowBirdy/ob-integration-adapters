import type { BasePoolState } from "../../base/BasePoolState";
import type { Address } from "viem";

export interface NablaPoolState extends BasePoolState {
  // token0: Address;
	// token1: Address;
	// address: Address;
	// reserve0: bigint;
	// reserve1: bigint;
  // Additional properties for Nabla's unique pool structure
  reserveWithSlippage0: bigint; // Tracks the pool's imbalance for price calculations
  reserveWithSlippage1: bigint; // Tracks the pool's imbalance for price calculations
  totalLiabilities0: bigint;
  totalLiabilities1: bigint;
  oraclePrice?: bigint; // Price from the oracle
  reversedOraclePrice?: bigint; // Reversed price from the oracle
  router: Address;
  pool0: Address;
  pool1: Address;
  fee0: bigint;
  fee1: bigint;
  lpFee0: bigint;
  lpFee1: bigint;
  priceFeedUpdate: `0x${string}`[];
  beta0: bigint;
  beta1: bigint;
  c0: bigint;
  c1: bigint;
  assetDecimals0: number;
  assetDecimals1: number;
} 