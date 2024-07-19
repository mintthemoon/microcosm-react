import type { ChainConfig, ChainState } from "$types"
import { buildContext } from "$util"

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
