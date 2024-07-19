import type { AccountData, EncodeObject, OfflineSigner } from "@cosmjs/proto-signing"
import type { DeliverTxResponse, SigningStargateClient } from "@cosmjs/stargate"
import type { ReactNode } from "react"

// CONTEXT
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

export type WalletContext =
  & WalletState
  & {
    setProvider: (name: string) => void
    disconnectProvider: () => void
    broadcast: (msgs: EncodeObject[], memo?: string) => Promise<DeliverTxResponse>
  }

// PROVIDER
export type WalletProviderCleanupFn = () => void
export type WalletProviderConnectFn = (
  chainId: string,
  signerCb: (signer: OfflineSigner | undefined) => void,
  errorCb: (err: Error) => void,
) => Promise<WalletProviderCleanupFn>

export type WalletProvider = {
  name: string
  logo: () => ReactNode | string
  connect: WalletProviderConnectFn
}

// STORE
export type WalletConnectionStoreData = { provider: string }
