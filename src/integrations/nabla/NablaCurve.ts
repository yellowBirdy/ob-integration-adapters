

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

        if (iB === 0n || iL === 0n) {
            psi = 0n;
        } else {
            const diff = iB > iL ? iB - iL : iL - iB;

            psi = this.beta * (diff * diff) / (iB + this.c * iL) + iB;
        }

        return this.convertDecimals(psi, decimals);
    }

    public inverseDiagonal(b: bigint, l: bigint, capitalB: bigint, decimals: bigint): bigint {
        const iB = this.convertDecimals(b, decimals);
        const iL = this.convertDecimals(l, decimals);
        const iCapitalB = this.convertDecimals(capitalB, decimals);

        const quadraticA = NablaCurve.MANTISSA + this.c;
        const quadraticB = iB + (this.c * iL) - 
            (capitalB - iB) * quadraticA;

        const factor = (iB - iL) * (iB - iL);
        const quadraticC = this.beta * (iB) * factor - (iCapitalB - iB) * (iB + this.c * iL);

        const t = this.solveQuadratic(quadraticA, quadraticB, quadraticC);

        return this.convertDecimals(t, decimals);
    }

    public inverseHorizontal(b: bigint, l: bigint, capitalB: bigint, decimals: bigint): bigint {
        const iB = this.convertDecimals(b, decimals);
        const iL = this.convertDecimals(l, decimals);
        const iCapitalB = this.convertDecimals(capitalB, decimals);

        const quadraticA = NablaCurve.MANTISSA + this.beta;
        const quadraticB = 2n * this.beta * (iB - iL) - iCapitalB + (2n * iB) + this.c * iL;

        const factor = (iB - iL) * (iB - iL);
        const quadraticC = this.beta * factor - (iCapitalB - iB) * (iB + this.c * iL);

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
        let discriminant = b * b - (4n * a * c);
        discriminant = discriminant < 0n ? 0n : discriminant;
        
        const almostSolution = ( -b + this.sqrt(discriminant)) / (2n * a);
        const solution = almostSolution < 0n ? 0n : almostSolution;

        return solution;
    }

    private sqrt(value: bigint): bigint {
        return BigInt(Math.sqrt(Number(value)));
    }

}

export default NablaCurve;