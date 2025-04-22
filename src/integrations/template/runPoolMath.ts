import { parseEther, zeroAddress } from "viem";
import { TemplatePoolMath } from "./TemplatePoolMath";

const poolMath = new TemplatePoolMath();

const out = poolMath.swapExactInput(
	{
		address: zeroAddress,
		token0: zeroAddress,
		token1: zeroAddress,
		reserve0: 0n,
		reserve1: 0n,
	},
	true,
	parseEther("1"),
);

console.log("Result is", out);
