import { WalletStoreKey } from "$lib/data"
import { SonarProvider, StaticWallets } from "$lib/wallet"
import type {
  Wallet,
  WalletAction,
  WalletConnectResult,
  WalletOpts,
  WalletProviderProps,
  WalletState,
} from "$types"
import { autoctx } from "$util"
import { type DeliverTxResponse, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { coins, type EncodeObject } from "@cosmjs/proto-signing"
import { SigningStargateClient } from "@cosmjs/stargate"
import { useCallback } from "react"
import { useChain } from "./use-chain"
import { useError } from "./use-error"
import { useDebounceFn, useLocalStore } from "./use-utility"

const InitWalletState: WalletState = { isReady: false, isConnecting: false, wallets: StaticWallets }
const [BaseWalletProvider, useWalletReducer] = autoctx<WalletState, WalletOpts>(InitWalletState)

export const WalletProvider = ({ children, cfg }: WalletProviderProps) => {
  return (
    <BaseWalletProvider cfg={cfg}>
      {children}
      <SonarProvider />
    </BaseWalletProvider>
  )
}

export const useWallet = () => {
  const [state, dispatch] = useWalletReducer()
  const { val: storedWallet, setStore: setWalletStore, clearStore: clearWalletStore } = useLocalStore(
    WalletStoreKey,
  )
  const { chainId, rpcUrl, info } = useChain()
  const { setError } = useError()

  const register = useCallback((wallet: Wallet) => {
    dispatch((prev) => {
      if (prev.wallets?.[wallet.name]) return prev
      return { ...prev, wallets: { ...prev.wallets, [wallet.name]: wallet } }
    })
  }, [dispatch])

  const onSignerChange = useCallback(async (res: WalletConnectResult | Error) => {
    try {
      if (res instanceof Error) throw res
      if (!rpcUrl) throw new Error("Unable to connect wallet provider; missing chain RPC url")
      if (!state.isConnecting) dispatch({ isConnecting: true, isReady: false })
      const [signer, onDisconnect] = res
      const [account] = await signer.getAccounts()
      if (!account) throw new Error("No accounts found in connected wallet")
      const { address: addr } = account
      const stargateSignClient = await SigningStargateClient.connectWithSigner(rpcUrl, signer)
      const cosmwasmSignClient = await SigningCosmWasmClient.connectWithSigner(rpcUrl, signer)
      const stateUpdate: WalletAction = {
        signer,
        addr,
        account,
        stargateSignClient,
        cosmwasmSignClient,
        isConnecting: false,
        isReady: true,
      }
      if (onDisconnect) stateUpdate.onDisconnect = onDisconnect
      dispatch(stateUpdate)
    } catch (err) {
      setError(err as Error)
      dispatch({ isConnecting: false, isReady: false })
    }
  }, [state.isConnecting, rpcUrl, dispatch, setError])

  const updateSigner = useCallback((res: WalletConnectResult | Error) => onSignerChange(res), [
    onSignerChange,
  ])

  const connect = useDebounceFn(useCallback(async (name: string) => {
    try {
      if (!chainId || name === state.wallet?.name) return
      dispatch({ isConnecting: false, isReady: false })
      if (state.onDisconnect) state.onDisconnect()
      const wallet = state.wallets?.[name]
      if (!wallet) throw new Error(`No wallet found for ${name}`)
      await wallet.connect(chainId, updateSigner)
      setWalletStore(name)
      dispatch({ wallet })
    } catch (err) {
      setError(err as Error)
    }
  }, [
    dispatch,
    chainId,
    state.wallet,
    state.wallets,
    state.onDisconnect,
    setError,
    setWalletStore,
    updateSigner,
  ]))

  const disconnect = useCallback(() => {
    if (state.onDisconnect) state.onDisconnect()
    dispatch(InitWalletState)
    clearWalletStore()
  }, [dispatch, clearWalletStore, state.onDisconnect])

  const broadcast = useCallback(
    async (
      messages: EncodeObject[],
      memo?: string,
      onError?: (err: Error) => void,
    ): Promise<DeliverTxResponse | undefined> => {
      if (!state.isReady || !state.stargateSignClient || !state.account || !info) {
        throw new Error("Wallet is not connected")
      }
      try {
        const gasEstimate = await state.stargateSignClient.simulate(state.account.address, messages, memo)
        const gasAdjusted = Math.ceil(gasEstimate * info.defaults.gasAdjustment)
        const feeDenom = info.fees.get(info.defaults.feeSymbol)
        if (!feeDenom) throw new Error("Could not determine fee denom")
        const feeAmount = Math.ceil(gasAdjusted * feeDenom.gasPrice)
        console.log("Gas estimate:", gasAdjusted)
        const fee = { amount: coins(feeAmount.toString(), feeDenom.base), gas: gasAdjusted.toString() }
        return await state.stargateSignClient.signAndBroadcast(state.account.address, messages, fee, memo)
      } catch (err) {
        if (onError) onError(err as Error)
        else setError(err as Error)
      }
    },
    [state.isReady, state.stargateSignClient, state.account, info, setError],
  )

  // useEffect(() => {
  //   if (!state.provider && storedProvider && state.providers && storedProvider in state.providers) {
  //     console.log("Restoring stored wallet provider", storedProvider)
  //     connect(storedProvider)
  //   }
  // })

  return { ...state, connect, disconnect, broadcast, register }
}
