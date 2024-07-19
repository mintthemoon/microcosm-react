export type Denom = { base: string; symbol?: string; exponent: number }

export type FeeDenom = Denom & { gasPrice: number; minGasPrice?: number }

export type Asset = Denom & { logoUrl: string | undefined; scaleBase: (amount: bigint) => number }

export type Token = { denom: Denom; amount: bigint; displayAmount: string }

export type Tokens = Map<string, Token>
