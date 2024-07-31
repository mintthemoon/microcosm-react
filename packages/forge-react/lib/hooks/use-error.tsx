import type { ErrorOpts, ErrorState } from "$types"
import { autoctx } from "$util"
import { useStaticCb } from "devhooks"

const initErrorState: ErrorState = {}
const [ErrorProvider, useErrorReducer] = autoctx<ErrorState, ErrorOpts>(initErrorState)
export { ErrorProvider }

export const useError = () => {
  const [state, dispatch] = useErrorReducer()

  const setError = useStaticCb((error: Error) => {
    console.error(error)
    dispatch({ error })
  }, [dispatch])

  const clearError = useStaticCb(() => {
    dispatch({ error: undefined })
  }, [dispatch])

  return { ...state, setError, clearError }
}
