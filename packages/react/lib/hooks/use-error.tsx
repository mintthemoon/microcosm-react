import type { ErrorOpts, ErrorState } from "$types"
import { autoctx } from "$util"
import { useCallback, useEffect } from "react"

const initErrorState: ErrorState = {}
const [ErrorProvider, useErrorReducer] = autoctx<ErrorState, ErrorOpts>(initErrorState)
export { ErrorProvider }

export const useError = () => {
  const [state, dispatch] = useErrorReducer()

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
