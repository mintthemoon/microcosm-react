// ======= CHAIN ========
export type ChainDefaults = { feeSymbol: string; gasAdjustment: number }
export type ChainData = {
  chainId: string
  displayName: string
  logoUrl: string | undefined
  fees: Map<string, FeeDenom>
  assets: Map<string, Asset>
  symbols: Map<string, string>
  defaults: ChainDefaults
  getAsset: (base: string) => Asset | undefined
}

// ======= TOKENS =======
export type Denom = { base: string; symbol?: string; exponent: number }
export type FeeDenom = Denom & { gasPrice: number; minGasPrice?: number }
export type Asset = Denom & { logoUrl: string | undefined; scaleBase: (amount: bigint) => number }
export type Token = { denom: Denom; amount: bigint; displayAmount: string }
export type Tokens = Map<string, Token>
