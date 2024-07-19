import { coinsToTokens, getChain } from "$lib/data"
import type { ChainContext } from "$types"
import { buildHooks } from "$util"
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import { StargateClient } from "@cosmjs/stargate"
import { useCallback, useEffect } from "react"
import { ChainDispatchContext, ChainStateContext } from "./ctx-chain"
import { useError } from "./use-error"

export const useChain = (): ChainContext => {
  const { useContextState: useChainState, useContextDispatch: useChainDispatch } = buildHooks(
    "Chain",
    ChainStateContext,
    ChainDispatchContext,
  )
  const state = useChainState()
  const dispatch = useChainDispatch()
  const { setError } = useError()

  const updateChainInfo = useCallback(() => {
    try {
      if (!state.chainId || !state.rpcUrl) {
        dispatch({ isReady: false })
        return
      }
      dispatch({ info: getChain(state.chainId) })
    } catch (err) {
      setError(err as Error)
      dispatch({ isReady: false })
    }
  }, [setError, dispatch, state.chainId, state.rpcUrl])

  const updateChainClients = useCallback(async () => {
    try {
      if (!state.chainId || !state.rpcUrl || !state.info) {
        dispatch({ isReady: false })
        return
      }
      const stargateClient = await StargateClient.connect(state.rpcUrl)
      const cosmwasmClient = await CosmWasmClient.connect(state.rpcUrl)
      dispatch({ stargateClient, cosmwasmClient, isReady: true })
    } catch (err) {
      setError(err as Error)
      dispatch({ isReady: false })
    }
  }, [setError, dispatch, state.chainId, state.rpcUrl, state.info])

  useEffect(() => {
    updateChainInfo()
  }, [updateChainInfo])

  useEffect(() => {
    void updateChainClients()
  }, [updateChainClients])

  const queryAddrTokens = useCallback(async (addr: string) => {
    try {
      if (!state.isReady || !state.stargateClient || !state.info) {
        throw new Error("Chain client is not connected")
      }
      return coinsToTokens(await state.stargateClient.getAllBalances(addr), state.info)
    } catch (err) {
      setError(err as Error)
      return undefined
    }
  }, [setError, state.isReady, state.stargateClient, state.info])

  const queryContract = useCallback(async (addr: string, query: Record<string, unknown> | string) => {
    try {
      if (!state.isReady || !state.cosmwasmClient) {
        throw new Error("Chain client is not connected")
      }
      return state.cosmwasmClient.queryContractSmart(addr, query)
    } catch (err) {
      setError(err as Error)
      return undefined
    }
  }, [setError, state.isReady, state.cosmwasmClient])

  return { ...state, queryAddrTokens, queryContract }
}
