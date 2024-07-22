import { WalletConnectionStore } from "$lib/data"
import { defaultWalletState, getProvider } from "$lib/wallet"
import type { WalletContext } from "$types"
import { buildHooks } from "$util"
import { type DeliverTxResponse, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { coins, type EncodeObject, type OfflineSigner } from "@cosmjs/proto-signing"
import { SigningStargateClient } from "@cosmjs/stargate"
import { useCallback, useEffect } from "react"
import { WalletDispatchContext, WalletStateContext } from "./ctx-wallet"
import { useChain } from "./use-chain"
import { useError } from "./use-error"

export const useWallet = (): WalletContext => {
  const { useContextState: useWalletState, useContextDispatch: useWalletDispatch } = buildHooks(
    "Wallet",
    WalletStateContext,
    WalletDispatchContext,
  )
  const state = useWalletState()
  const dispatch = useWalletDispatch()
  const { chainId, rpcUrl, info } = useChain()
  const { setError } = useError()

  const setSigner = useCallback((signer?: OfflineSigner) => {
    dispatch({ signer, isReady: false })
  }, [dispatch])

  const connect = useCallback((name: string) => {
    try {
      if (!chainId || name === state.provider?.name) return
      dispatch({ isReady: false })
      if (state.onProviderDisconnect) state.onProviderDisconnect()
      const provider = getProvider(name)
      if (!provider) throw new Error(`No wallet provider found for ${name}`)
      WalletConnectionStore.set({ provider: name })
      dispatch({ ...defaultWalletState, provider })
    } catch (err) {
      setError(err as Error)
    }
    // eslint you are going to give me an aneurysm. what on earth. no I should not include `state` as a dep here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId, state.provider, state.onProviderDisconnect, setError])

  const disconnect = useCallback(() => {
    if (state.onProviderDisconnect) state.onProviderDisconnect()
    dispatch(defaultWalletState)
    WalletConnectionStore.delete()
    // see above comment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.onProviderDisconnect])

  const broadcast = useCallback(
    async (messages: EncodeObject[], memo?: string): Promise<DeliverTxResponse> => {
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
      } catch (error) {
        console.error("Broadcast failed:", error)
        throw error
      }
    },
    [state.isReady, state.stargateSignClient, state.account, info],
  )

  const updateSignerInfo = useCallback(async () => {
    try {
      if (state.isReady || !chainId || !rpcUrl || !state.provider) return
      if (!state.signer) {
        const onProviderDisconnect = await state.provider.connect(chainId, setSigner, setError)
        dispatch({ onProviderDisconnect })
        return
      }
      const [account] = await state.signer.getAccounts()
      if (!account) throw new Error("No accounts found in connected wallet")
      const { address: addr } = account
      const stargateSignClient = await SigningStargateClient.connectWithSigner(rpcUrl, state.signer)
      const cosmwasmSignClient = await SigningCosmWasmClient.connectWithSigner(rpcUrl, state.signer)
      dispatch({ addr, account, stargateSignClient, cosmwasmSignClient, isReady: true })
    } catch (err) {
      setError(err as Error)
    }
  }, [state.isReady, state.provider, state.signer, chainId, rpcUrl, setSigner, setError, dispatch])

  useEffect(() => {
    void updateSignerInfo()
  }, [updateSignerInfo])

  useEffect(() => {
    if (!state.provider) {
      const provider = WalletConnectionStore.get()?.provider
      if (provider) connect(provider)
    }
  })

  return { ...state, connect, disconnect, broadcast }
}
