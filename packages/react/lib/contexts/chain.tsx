import type { ChainData, Tokens } from "$types"
import { buildContext } from "$util"
import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import type { StargateClient } from "@cosmjs/stargate"

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

const defaultChainState: ChainState = {
  chainId: undefined,
  displayName: undefined,
  logoUrl: undefined,
  rpcUrl: undefined,
  info: undefined,
  stargateClient: undefined,
  cosmwasmClient: undefined,
  error: undefined,
  isReady: false,
}

const {
  ContextProvider: ChainContextProvider,
  StateContext: ChainStateContext,
  DispatchContext: ChainDispatchContext,
} = buildContext<ChainState, ChainConfig>(defaultChainState)

export { ChainContextProvider, ChainDispatchContext, ChainStateContext }
