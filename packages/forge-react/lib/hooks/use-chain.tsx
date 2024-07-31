import { coinsToTokens, getChain } from "$lib/data"
import { MicrocosmClient } from "$lib/microcosm"
import type { ChainOpts, ChainState } from "$types"
import { autoctx } from "$util"
import { useStaticCb } from "devhooks"
import { useCallback, useEffect } from "react"
import { useError } from "./use-error"

export const initChainState = { isReady: false }
const [ChainProvider, useChainReducer] = autoctx<ChainState, ChainOpts>(initChainState)
export { ChainProvider }

export const useChain = () => {
  const [state, dispatch] = useChainReducer()
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
      const microcosmClient = await MicrocosmClient({ rpcUrl: state.rpcUrl })
      const stargateClient = await microcosmClient.clients.stargate()
      const cosmwasmClient = await microcosmClient.clients.cosmwasm()
      dispatch({ microcosmClient, stargateClient, cosmwasmClient, isReady: true })
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

  const queryAddrTokens = useStaticCb(async (addr: string) => {
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

  const queryContract = useStaticCb(async (addr: string, query: Record<string, unknown> | string) => {
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

  const queryAccount = useStaticCb(async (addr: string) => {
    try {
      if (!state.isReady || !state.stargateClient) throw new Error("Chain client is not connected")
      return state.stargateClient.getAccount(addr)
    } catch (err) {
      setError(err as Error)
      return undefined
    }
  }, [setError, state.isReady, state.stargateClient])

  return { ...state, queryAddrTokens, queryContract, queryAccount }
}
