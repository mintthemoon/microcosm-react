import {
  type Context,
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useCallback,
  useContext,
  useReducer,
} from "react"

type RecordWithError = Record<string, unknown> & { error?: Error }
type DispatchValue<T extends Partial<RecordWithError>> = {
  dispatch: Dispatch<T>
  useDispatchCb: (
    fn: (args?: unknown) => T | undefined,
    errorCb?: (err: Error) => void,
  ) => (args?: unknown) => void
  useDispatchCbAsync: (
    fn: (args?: unknown) => Promise<T | undefined>,
    errorCb?: (err: Error) => void,
  ) => (args?: unknown) => void
}

export const buildContext = <T extends RecordWithError, C extends Record<string, unknown>>(
  initialState: T,
) => {
  type ContextState = T
  type ContextAction = Partial<ContextState>
  type ContextConfig = C
  type ContextProps = PropsWithChildren<{ config?: ContextConfig }>
  type ContextDispatch = DispatchValue<ContextAction>

  const contextReducer = (state: ContextState, action: ContextAction): ContextState => ({
    ...state,
    ...action,
  })
  const StateContext = createContext<ContextState | undefined>(initialState)
  const DispatchContext = createContext<ContextDispatch | undefined>(undefined)
  const ContextProvider = ({ children, config }: ContextProps) => {
    const [state, dispatch] = useReducer(contextReducer, initialState)

    const useDispatchCb = (
      fn: (args?: unknown) => Record<string, unknown> | undefined,
      errorCb?: (err: Error) => void,
    ) => {
      return useCallback((args?: unknown) => {
        try {
          const action = fn(args)
          if (action === undefined) return
          dispatch(action as ContextAction)
        } catch (err) {
          if (errorCb) {
            errorCb(err as Error)
          } else {
            dispatch({ error: err as Error } as ContextAction)
          }
        }
      }, [fn, errorCb])
    }

    const useDispatchCbAsync = (
      fn: (args: unknown) => Promise<Record<string, unknown> | undefined>,
      errorCb?: (err: Error) => void,
    ) => {
      return useCallback(async (args: unknown) => {
        try {
          const action = await fn(args)
          if (action === undefined) return
          dispatch(action as ContextAction)
        } catch (err) {
          if (errorCb) {
            errorCb(err as Error)
          } else {
            dispatch({ error: err as Error } as ContextAction)
          }
        }
      }, [fn, errorCb])
    }

    return (
      <StateContext.Provider value={{ ...state, ...config }}>
        <DispatchContext.Provider value={{ dispatch, useDispatchCb, useDispatchCbAsync }}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    )
  }

  return { ContextProvider, StateContext, DispatchContext }
}

export const buildHooks = <S extends RecordWithError, A extends Partial<S>>(
  name: string,
  StateContext: Context<S | undefined>,
  DispatchContext: Context<DispatchValue<A> | undefined>,
) => {
  const useContextState = () => {
    const context = useContext(StateContext)
    if (context === undefined) {
      throw new Error(`use${name}State must be used within a ${name}StateProvider`)
    }
    return context
  }
  const useContextDispatch = () => {
    const context = useContext(DispatchContext)
    if (context === undefined) {
      throw new Error(`use${name}Dispatch must be used within a ${name}DispatchProvider`)
    }
    return context
  }
  return { useContextState, useContextDispatch }
}
