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
import { coins, type EncodeObject } from "@cosmjs/proto-signing"
import { assertIsDeliverTxSuccess, type DeliverTxResponse } from "@cosmjs/stargate"
import { useAsyncEffect, useLocalStore, useObserveState, useStaticCb, useStaticMutexCb } from "devhooks"
import { useCallback, useRef } from "react"
import { useChain } from "./use-chain"
import { useError } from "./use-error"

const InitWalletState: WalletState = { isReady: false, isConnecting: false, wallets: StaticWallets }
const [BaseWalletProvider, useWalletReducer] = autoctx<WalletState, WalletOpts>(InitWalletState)

export const WalletProvider = ({ children, cfg }: WalletProviderProps) => {
  useObserveState("wallet props", { children, cfg })
  return (
    <BaseWalletProvider cfg={cfg}>
      {children}
      <SonarProvider />
    </BaseWalletProvider>
  )
}

export const useWallet = () => {
  const [state, dispatch] = useWalletReducer()
  const { chainId, rpcUrl, info, microcosmClient, isReady: isChainReady } = useChain()
  const { setError } = useError()
  const [walletStore, setWalletStore] = useLocalStore<string>(WalletStoreKey)

  const register = useStaticCb((wallet: Wallet) => {
    dispatch((prev) => {
      if (prev.wallets?.[wallet.name]) return prev
      return { ...prev, wallets: { ...prev.wallets, [wallet.name]: wallet } }
    })
  })

  const onSignerChange = useCallback(async (res: WalletConnectResult | Error) => {
    try {
      if (res instanceof Error) throw res
      if (!rpcUrl || !microcosmClient) {
        throw new Error("Unable to connect wallet provider; chain connection not initialized")
      }
      if (!state.isConnecting) dispatch({ isConnecting: true, isReady: false })
      const [signer, onDisconnect] = res
      const [account] = await signer.getAccounts()
      if (!account) throw new Error("No accounts found in connected wallet")
      const { address: addr } = account
      const stargateSignClient = await microcosmClient.clients.signingStargate(signer)
      const cosmwasmSignClient = await microcosmClient.clients.signingCosmwasm(signer)
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
  }, [state.isConnecting, rpcUrl, microcosmClient, dispatch, setError])

  const updateSigner = useCallback((res: WalletConnectResult | Error) => onSignerChange(res), [
    onSignerChange,
  ])

  const connect = useStaticMutexCb(async (name: string) => {
    try {
      if (!chainId || name === state.wallet?.name) return
      dispatch({ isConnecting: false, isReady: false })
      if (state.onDisconnect) state.onDisconnect()
      const wallet = state.wallets?.[name]
      if (!wallet) throw new Error(`No wallet found for ${name}`)
      await wallet.connect(chainId, updateSigner)
      await setWalletStore(name)
      dispatch({ wallet })
    } catch (err) {
      disconnect()
      setError(err as Error)
    }
  }, [dispatch, chainId, state.wallet, state.wallets, state.onDisconnect, setError, updateSigner])

  const disconnect = useCallback(() => {
    if (state.onDisconnect) state.onDisconnect()
    dispatch(InitWalletState)
    setWalletStore()
  }, [dispatch, state.onDisconnect, setWalletStore])

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
        const res = await state.stargateSignClient.signAndBroadcast(
          state.account.address,
          messages,
          fee,
          memo,
        )
        assertIsDeliverTxSuccess(res)
        return res
      } catch (err) {
        if (onError) onError(err as Error)
        else setError(err as Error)
      }
    },
    [state.isReady, state.stargateSignClient, state.account, info, setError],
  )

  const shouldRestore = useRef(true)
  useAsyncEffect(async () => {
    if (!shouldRestore.current || !isChainReady || !connect || !walletStore.ok || state.wallet) return
    shouldRestore.current = false
    await connect(walletStore.ok)
  }, [connect, state.wallet, isChainReady, walletStore.ok])

  return { ...state, connect, disconnect, broadcast, register }
}
