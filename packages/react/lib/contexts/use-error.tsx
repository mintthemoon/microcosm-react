import { buildHooks } from "$util"
import { useCallback, useEffect } from "react"
import { ErrorDispatchContext, ErrorStateContext, type ErrorContext } from "./error"

export const useError = (): ErrorContext => {
  const { useContextState: useErrorState, useContextDispatch: useErrorDispatch } = buildHooks(
    "Error",
    ErrorStateContext,
    ErrorDispatchContext,
  )
  const state = useErrorState()
  const { dispatch } = useErrorDispatch()

  const setError = useCallback((error: Error) => {
    dispatch({ error })
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch({ error: undefined })
  }, [dispatch])

  useEffect(() => {
    if (state.error) {
      console.error(state.error)
    }
  }, [state.error])

  return { ...state, setError, clearError }
}
