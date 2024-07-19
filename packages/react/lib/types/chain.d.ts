import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import type { StargateClient } from "@cosmjs/stargate"
import type { Asset, FeeDenom, Tokens } from "./tokens"

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

export type ChainConfig = { chainId: string; rpcUrl: string }

export type ChainState = Record<string, unknown> & {
  chainId?: string
  rpcUrl?: string
  info?: ChainData
  stargateClient?: StargateClient
  cosmwasmClient?: CosmWasmClient
  isReady: boolean
}

export type ChainContext = ChainState & {
  queryAddrTokens: (addr: string) => Promise<Tokens | undefined>
  queryContract: (addr: string, query: Record<string, unknown> | string) => Promise<Record<string, unknown>>
}
