import type { OfflineSigner } from "@cosmjs/proto-signing"
import type { ReactNode } from "react"

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

// ======= WALLET =======
// PROVIDER
export type WalletProvider = {
  name: string
  logo: () => ReactNode | string
  connect: WalletProviderConnectFn
}
export type WalletProviderCleanupFn = () => void
export type WalletProviderConnectFn = (
  chainId: string,
  signerCb: (signer: OfflineSigner | undefined) => void,
  errorCb: (err: Error) => void,
) => Promise<WalletProviderCleanupFn>

// STORE
export type WalletConnectionStoreData = { provider: string }

// ======= TOKENS =======
export type Denom = { base: string; symbol?: string; exponent: number }
export type FeeDenom = Denom & { gasPrice: number; minGasPrice?: number }
export type Asset = Denom & { logoUrl: string | undefined; scaleBase: (amount: bigint) => number }
export type Token = { denom: Denom; amount: bigint; displayAmount: string }
export type Tokens = Map<string, Token>
