import { defaultWalletState } from "$lib/wallet"
import type { WalletConfig, WalletState } from "$types"
import { buildContext } from "$util"

const {
  ContextProvider: WalletContextProvider,
  StateContext: WalletStateContext,
  DispatchContext: WalletDispatchContext,
} = buildContext<WalletState, WalletConfig>(defaultWalletState)

export { WalletContextProvider, WalletDispatchContext, WalletStateContext }
