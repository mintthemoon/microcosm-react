import type { ErrorConfig, ErrorState } from "$types"
import { buildContext } from "$util"

const defaultErrorState: ErrorState = { error: undefined }

const {
  ContextProvider: ErrorContextProvider,
  StateContext: ErrorStateContext,
  DispatchContext: ErrorDispatchContext,
} = buildContext<ErrorState, ErrorConfig>(defaultErrorState)

export { ErrorContextProvider, ErrorDispatchContext, ErrorStateContext }
