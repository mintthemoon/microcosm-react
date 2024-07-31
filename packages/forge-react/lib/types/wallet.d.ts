import type { HybridSigner } from "$lib/microcosm"
import type { ModalProps, PropsWithoutChildren, UnknownRecord } from "$types"
import type { FunctionComponent, ReactNode } from "react"

// PROVIDER
export type Wallet = { name: string; logo: () => ReactNode | string; connect: WalletConnectFn }
export type WalletConnectFn = (
  chainId: string,
  updateSigner: (res: WalletConnectResult | Error) => void,
) => Promise<void>
export type WalletConnectResult = [HybridSigner, (() => void)?]

// SONAR
export declare const SonarProvider: FunctionComponent<SonarProviderProps>
export declare const SonarConnectModal: FunctionComponent<ModalProps>
export type SonarProviderProps = PropsWithoutChildren<{ connectTimeout?: number }>
export type SonarConnectModalProps = PropsWithoutChildren<ModalProps & { url?: string }>

// KEPLR
export type KeplrInterface = UnknownRecord & {
  enable: (chainId: string) => Promise<void>
  getOfflineSigner: (chainId: string) => HybridSigner
}
