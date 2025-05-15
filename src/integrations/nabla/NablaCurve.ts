
export const mul = (a: bigint, b: bigint): bigint => {
    return a * b / NablaCurve.MANTISSA;
}

export const div = (a: bigint, b: bigint): bigint => {
    return a * NablaCurve.MANTISSA / b;
}

class NablaCurve {
    public static readonly DECIMALS: bigint = 18n;
    public static readonly MANTISSA: bigint = BigInt(1e18);
    public  beta: bigint;
    public  c: bigint;

    constructor(beta: bigint, c: bigint ) {
        this.beta = beta;
        this.c = c;
    }

    public psi(b: bigint, l: bigint, decimals: bigint): bigint {
        let psi: bigint;
        
        const iB = this.convertDecimals(b, decimals);
        const iL = this.convertDecimals(l, decimals);

        if (iB === 0n && iL === 0n) {
            psi = 0n;
        } else {
            const diff = iB > iL ? iB - iL : iL - iB;

            const diffSquared = mul(diff, diff);
            psi = div(mul(this.beta, diffSquared), iB + mul(this.c, iL)) + iB;
        }

        return this.convertDecimals(psi, decimals);
    }

    public inverseDiagonal(b: bigint, l: bigint, capitalB: bigint, decimals: bigint): bigint {
        const iB = this.convertDecimals(b, decimals);
        const iL = this.convertDecimals(l, decimals);
        const iCapitalB = this.convertDecimals(capitalB, decimals);

        const quadraticA = NablaCurve.MANTISSA + this.c;
        const quadraticB = iB + mul(this.c, iL) - 
            mul(iCapitalB - iB, quadraticA);

        const factor = mul(iB - iL, iB - iL);
        const quadraticC = mul(this.beta, factor) - mul(iCapitalB - iB, iB + mul(this.c, iL));

        const t = this.solveQuadratic(quadraticA, quadraticB, quadraticC);

        return this.convertDecimals(t, decimals);
    }

    public inverseHorizontal(b: bigint, l: bigint, capitalB: bigint, decimals: bigint): bigint {
        const iB = this.convertDecimals(b, decimals);
        const iL = this.convertDecimals(l, decimals);
        const iCapitalB = this.convertDecimals(capitalB, decimals);

        const quadraticA = NablaCurve.MANTISSA + this.beta;
        const quadraticB = mul(2n * this.beta, (iB - iL)) - iCapitalB + (2n * iB) + mul(this.c, iL);

        const factor = mul(iB - iL, iB - iL);
        const quadraticC = mul(this.beta, factor) - mul(iCapitalB - iB, iB + mul(this.c, iL));

        const t = this.solveQuadratic(quadraticA, quadraticB, quadraticC);
        return this.convertDecimals(t, decimals);
    }

    private convertDecimals(value: bigint, decimals: bigint): bigint {
        let convertedValue: bigint;

        if (decimals > NablaCurve.DECIMALS) {
            convertedValue = value * 10n ** (decimals - NablaCurve.DECIMALS);
        } else {
            convertedValue = value / 10n ** (NablaCurve.DECIMALS - decimals);
        }

        return convertedValue;
    }

    private solveQuadratic(a: bigint, b: bigint, c: bigint): bigint {
        let discriminant = mul(b, b) - mul((4n * a), c);
        discriminant = discriminant < 0n ? 0n : discriminant;
        const almostSolution = div( -b + this.sqrt(discriminant), (2n * a));
        const solution = almostSolution < 0n ? 0n : almostSolution;

        return solution;
    }


    private sqrt(_a: bigint): bigint {
        const a = _a * NablaCurve.MANTISSA;
        if (a === 0n) return 0n;
    
        let result = 1n << (this.log2(a) >> 1n);
        // Newton-Raphson iterations (7 times)
        result = (result + a / result) >> 1n;
        result = (result + a / result) >> 1n;
        result = (result + a / result) >> 1n;
        result = (result + a / result) >> 1n;
        result = (result + a / result) >> 1n;
        result = (result + a / result) >> 1n;
        result = (result + a / result) >> 1n;
    
        return this.min(result, a / result);
    }

    private log2(value: bigint): bigint {    
        let result = 0n;
    
        if (value >> 128n > 0) {
            value >>= 128n;
            result += 128n;
        }
        if (value >> 64n > 0) {
            value >>= 64n;
            result += 64n;
        }
        if (value >> 32n > 0) {
            value >>= 32n;
            result += 32n;
        }
        if (value >> 16n > 0) {
            value >>= 16n;
            result += 16n;
        }
        if (value >> 8n > 0) {
            value >>= 8n;
            result += 8n;
        }
        if (value >> 4n > 0) {
            value >>= 4n;
            result += 4n;
        }
        if (value >> 2n > 0) {
            value >>= 2n;
            result += 2n;
        }
        if (value >> 1n > 0) {
            result += 1n;
        }
    
        return result;
    }
    
    private min(a: bigint, b: bigint): bigint {
        return a < b ? a : b;
    }

}

export default NablaCurve;