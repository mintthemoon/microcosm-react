import {
  type Context,
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from "react"

export const buildContext = <S extends Record<string, unknown>, C extends Partial<S>>(initialState: S) => {
  type ContextState = S
  type ContextAction = Partial<ContextState>
  type ContextConfig = C
  type ContextProps = PropsWithChildren<{ config?: ContextConfig }>
  const contextReducer = (state: ContextState, action: ContextAction): ContextState => ({
    ...state,
    ...action,
  })
  const StateContext = createContext<ContextState | undefined>(initialState)
  const DispatchContext = createContext<Dispatch<ContextAction> | undefined>(undefined)
  const ContextProvider = ({ children, config }: ContextProps) => {
    const [state, dispatch] = useReducer(contextReducer, initialState)
    const mergedState = useMemo(() => ({ ...state, ...config }), [state, config])
    return (
      <StateContext.Provider value={mergedState}>
        <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
      </StateContext.Provider>
    )
  }
  return { ContextProvider, StateContext, DispatchContext }
}

export const buildHooks = <S extends Record<string, unknown>, A extends Partial<S>>(
  name: string,
  StateContext: Context<S | undefined>,
  DispatchContext: Context<Dispatch<A> | undefined>,
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
