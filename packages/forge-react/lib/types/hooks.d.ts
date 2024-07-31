import type { HybridSigner, MicrocosmClientInterface } from "$lib/microcosm"
import type { ChainData, EmptyRecord, Subset, Tokens, UnknownRecord, Wallet } from "$types"
import type { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import type { AccountData, EncodeObject, OfflineSigner, Registry } from "@cosmjs/proto-signing"
import type { DeliverTxResponse, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import type { FunctionComponent, PropsWithChildren, RefObject } from "react"

// DEEPCOMETFORGE
export declare const DeepcometForge: FunctionComponent<DeepcometForgeProviderProps>
export type DeepcometForgeCfg = ErrorCfg & ChainCfg & WalletCfg
export type DeepcometForgeProviderProps = PropsWithChildren<DeepcometForgeCfg>

// GENERIC
export type AutoCtx<S extends AutoCtxState, O extends AutoCtxOpts<S>, I extends AutoCtxInterface> = {
  Action: AutoCtxAction<S>
  Cfg: AutoCtxCfg<S, O>
  ProviderProps: AutoCtxProviderProps<S, O>
  HookCtx: AutoHookCtx<S, I>
  Hook: AutoHook<S, I>
}
export type AutoCtxState = UnknownRecord
export type AutoCtxOpts<S extends AutoCtxState> = Subset<S>
export type AutoCtxInterface = UnknownRecord
export type AutoCtxAction<S extends AutoCtxState> = Partial<S> | ((prev: S) => Subset<S>)
export type AutoCtxCfg<S extends AutoCtxState, O extends AutoCtxOpts<S>> = Subset<S> & O
export type AutoCtxProviderProps<S extends AutoCtxState, O extends AutoCtxOpts<S>> = PropsWithChildren<
  { cfg: O }
>
export type AutoHookCtx<S extends AutoCtxState, I extends AutoCtxInterface> = S & I
export type AutoHook<S extends AutoCtxState, I extends AutoCtxInterface> = () => AutoHookCtx<S, I>

// ERROR
export declare const useError: ErrorHook
export declare const ErrorProvider: FunctionComponent<ErrorProviderProps>
export type ErrorState = { error?: Error }
export type ErrorOpts = EmptyRecord
export type ErrorInterface = { setError: (error: Error) => void }
export type ErrorCtx = AutoCtx<ErrorState, ErrorOpts, ErrorInterface>
export type ErrorAction = ErrorCtx["Action"]
export type ErrorCfg = ErrorCtx["Cfg"]
export type ErrorProviderProps = ErrorCtx["ProviderProps"]
export type ErrorHookCtx = ErrorCtx["HookCtx"]
export type ErrorHook = ErrorCtx["Hook"]

// CHAIN
export declare const useChain: ChainHook
export declare const ChainProvider: FunctionComponent<ChainProviderProps>
export type ChainState = {
  chainId?: string
  rpcUrl?: string
  info?: ChainData
  microcosmClient?: MicrocosmClientInterface
  stargateClient?: StargateClient
  cosmwasmClient?: CosmWasmClient
  isReady: boolean
}
export type ChainOpts = { chainId: string; rpcUrl: string }
export type ChainInterface = {
  queryAddrTokens: (addr: string) => Promise<Tokens | undefined>
  queryContract: (addr: string, query: UnknownRecord | string) => Promise<unknown>
}
export type ChainCtx = AutoCtx<ChainState, ChainOpts, ChainInterface>
export type ChainAction = ChainCtx["Action"]
export type ChainCfg = ChainCtx["Cfg"]
export type ChainProviderProps = ChainCtx["ProviderProps"]
export type ChainHookCtx = ChainCtx["HookCtx"]
export type ChainHook = ChainCtx["Hook"]

// WALLET
export declare const useWallet: WalletHook
export declare const WalletProvider: FunctionComponent<WalletProviderProps>
export type WalletState = {
  addr?: string
  account?: AccountData
  wallet?: Wallet
  wallets?: Record<string, Wallet>
  onDisconnect?: () => void
  signer?: HybridSigner
  stargateSignClient?: SigningStargateClient
  cosmwasmSignClient?: SigningCosmWasmClient
  isReady: boolean
  isConnecting: boolean
}
export type WalletOpts = EmptyRecord
export type WalletInterface = {
  connect: (name: string) => void
  disconnect: () => void
  broadcast: (msgs: EncodeObject[], memo?: string) => Promise<DeliverTxResponse>
  register: (wallet: Wallet) => void
}
export type WalletCtx = AutoCtx<WalletState, WalletOpts, WalletInterface>
export type WalletAction = WalletCtx["Action"]
export type WalletCfg = WalletCtx["Cfg"]
export type WalletProviderProps = WalletCtx["ProviderProps"]
export type WalletHookCtx = WalletCtx["HookCtx"]
export type WalletHook = WalletCtx["Hook"]

// LOCAL STORE
export declare const useLocalStore: (key: string, initVal?: string) => LocalStoreHookCtx
export type LocalStoreState = { key: string; val?: string | null }
export type LocalStoreInterface = {
  setStore: (val: string) => void
  clearStore: () => void
  onStoreEvent: (ev: StorageEvent) => void
}
export type LocalStoreHookCtx = LocalStoreState & LocalStoreInterface
