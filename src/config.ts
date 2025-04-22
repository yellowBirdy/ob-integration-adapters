import { http, createPublicClient } from "viem";
import { berachain } from "viem/chains";

export const berachainClient = createPublicClient({
	chain: berachain,
	transport: http(),
});
