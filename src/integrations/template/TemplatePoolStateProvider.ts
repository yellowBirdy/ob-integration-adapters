import {
	type WatchContractEventOnLogsParameter,
	erc20Abi,
	zeroAddress,
} from "viem";
import { BasePoolStateProvider } from "../../base/PoolStateProvider";
import type { TemplateBasePoolState } from "./TemplateBasePoolState";

export class TemplatePoolStateProvider extends BasePoolStateProvider<TemplateBasePoolState> {
	readonly abi = erc20Abi;

	async getAllPools(): Promise<TemplateBasePoolState[]> {
		return [];
	}

	async swap(pool: TemplateBasePoolState, amountIn: bigint): Promise<void> {
		await this.client.simulateContract({
			address: pool.address,
			abi: this.abi,
			functionName: "transfer",
			args: [zeroAddress, amountIn],
		});
	}

	async handleEvent(
		log: WatchContractEventOnLogsParameter<typeof this.abi>[number],
	): Promise<void> {
		if (!log.address) {
			return;
		}

		switch (log.eventName) {
			case "Transfer": {
				console.log("transfer found", log.address);
				return;
			}
			case "Approval": {
				console.log("approval found", log.address);
				return;
			}
		}
	}
}
