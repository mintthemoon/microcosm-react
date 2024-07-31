import type { AutoCtxAction, AutoCtxOpts, AutoCtxProviderProps, AutoCtxState } from "$types"
import { unwrap } from "$util"
import { shallowMerge, useAutoReducer } from "devhooks"
import { createContext, type Dispatch, type FunctionComponent, useContext } from "react"

export const autoctx = <S extends AutoCtxState, O extends AutoCtxOpts<S>>(
  initVal: S,
): [FunctionComponent<AutoCtxProviderProps<S, O>>, () => [S, Dispatch<AutoCtxAction<S>>]] => {
  const StateCtx = createContext<S | undefined>(initVal)
  const DispatchCtx = createContext<Dispatch<AutoCtxAction<S>> | undefined>(undefined)
  const Provider = ({ children, cfg }: AutoCtxProviderProps<S, O>) => {
    const [state, dispatch] = useAutoReducer<S>(initVal)
    return (
      <StateCtx.Provider value={shallowMerge(state, cfg)}>
        <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
      </StateCtx.Provider>
    )
  }
  const useAutoCtxReducer = (): [
    S,
    Dispatch<AutoCtxAction<S>>,
  ] => [unwrap(useContext(StateCtx)), unwrap(useContext(DispatchCtx))]
  return [Provider, useAutoCtxReducer]
}
