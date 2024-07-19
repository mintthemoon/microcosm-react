import type { WalletProvider, WalletProviderCleanupFn } from "$types"
import { buildContext } from "$util"
import type { AccountData, OfflineSigner, EncodeObject } from "@cosmjs/proto-signing"
import type { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate"
import { defaultWalletState } from "$lib/wallet"

// WALLET
export type WalletConfig = Record<string, unknown>

export type WalletState = Record<string, unknown> & {
  addr?: string
  account?: AccountData
  provider?: WalletProvider
  onProviderDisconnect?: WalletProviderCleanupFn
  signer?: OfflineSigner
  stargateSignClient?: SigningStargateClient
  isReady: boolean
}

export type WalletContext = WalletState & {
  setProvider: (name: string) => void
  disconnectProvider: () => void
  broadcast: (msgs: EncodeObject[], memo?: string) => Promise<DeliverTxResponse>
}

const {
  ContextProvider: WalletContextProvider,
  StateContext: WalletStateContext,
  DispatchContext: WalletDispatchContext,
} = buildContext<WalletState, WalletConfig>(defaultWalletState)

export { WalletContextProvider, WalletDispatchContext, WalletStateContext }
