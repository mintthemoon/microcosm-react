import { buildContext } from "$util"

export type ErrorConfig = Record<string, unknown>

export type ErrorState = Record<string, unknown> & { error?: Error }

export type ErrorContext = ErrorState & {
  setError: (error: Error) => void
  clearError: () => void
}

const defaultErrorState: ErrorState = { error: undefined }

const {
  ContextProvider: ErrorContextProvider,
  StateContext: ErrorStateContext,
  DispatchContext: ErrorDispatchContext,
} = buildContext<ErrorState, ErrorConfig>(defaultErrorState)

export { ErrorContextProvider, ErrorDispatchContext, ErrorStateContext }
