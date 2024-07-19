import type { OfflineSigner } from "@cosmjs/proto-signing"
import type { ReactNode } from "react"

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

export type WalletConnectionStoreData = {
  provider: string
}
