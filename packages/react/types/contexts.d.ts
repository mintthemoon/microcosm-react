import type { AccountData, EncodeObject, OfflineSigner } from "@cosmjs/proto-signing"
import type { DeliverTxResponse, StargateClient, SigningStargateClient } from "@cosmjs/stargate"
import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import type { FunctionComponent, PropsWithChildren } from "react"
import type { ChainData, WalletProvider, WalletProviderCleanupFn, Tokens } from "./data"

// MICROCOSM
export declare const MicrocosmProvider: FunctionComponent<MicrocosmProps>
export type MicrocosmConfig = ErrorConfig & ChainConfig & WalletConfig
export type MicrocosmProps = PropsWithChildren<MicrocosmConfig>

// ERROR
export declare const useError: () => ErrorContext
export type ErrorConfig = Record<string, unknown>
export type ErrorState = Record<string, unknown> & { error?: Error }
export type ErrorContext =
  & ErrorState
  & { setError: (error: Error) => void; clearError: () => void }

// CHAIN
export declare const useChain: () => ChainContext
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

// WALLET
export declare const useWallet: () => WalletContext
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
  connect: (name: string) => void
  disconnect: () => void
  broadcast: (msgs: EncodeObject[], memo?: string) => Promise<DeliverTxResponse>
}
