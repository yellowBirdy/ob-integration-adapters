import type { Address } from "viem";

export const toLowerCaseAddress = (address: Address) =>
	address.toLowerCase() as Address;

export class AddressMap<T> extends Map<Address, T> {
	constructor(values?: [Address, T][] | null) {
		super(
			values?.map(([address, value]) => [toLowerCaseAddress(address), value]),
		);
	}

	override set(value: Address, data: T): this {
		super.set(value.toLowerCase() as Address, data);
		return this;
	}

	override delete(value: Address): boolean {
		return super.delete(value.toLowerCase() as Address);
	}

	override has(value: Address): boolean {
		return super.has(value.toLowerCase() as Address);
	}

	override get(value: Address): T | undefined {
		return super.get(value.toLowerCase() as Address);
	}
}
