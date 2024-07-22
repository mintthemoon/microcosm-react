import type { ClassValue } from "clsx"
import type { Context, Dispatch, FunctionComponent, PropsWithChildren } from "react"

// CLASS
export declare const cn: (...args: ClassValue[]) => string

// FMT
export declare const truncStr: (str: string | undefined, frontChars: number, backChars: number) => string
export declare const fmtAddrShort: (addr?: string) => string
export declare const fmtAddrLong: (addr?: string) => string
export declare const fmtDenom: (denom: string) => string
export declare const fmtAmount: (amount: bigint | number) => string

// HOOKS
export declare const useAsync: <A extends unknown[], R>(fnAsync: (...args: A) => Promise<R>, onError?: (err: Error) => void) => {
  res: R | undefined
  err: Error | undefined
  isReady: boolean
  fn: (...args: A) => void
}

// HOOK-BUILDER
export declare const buildContext: <S extends Record<string, unknown>, C extends Partial<S>>(
  initialState: S,
) => {
  ContextProvider: ContextProvider<C>
  StateContext: Context<S | undefined>
  DispatchContext: Context<Dispatch<Partial<S>> | undefined>
}
export declare const buildHooks: <S extends Record<string, unknown>, A extends Partial<S>>(
  name: string,
  StateContext: Context<S | undefined>,
  DispatchContext: Context<Dispatch<A> | undefined>,
) => { useContextState: () => S; useContextDispatch: () => Dispatch<A> }
export type ContextProvider<C> = FunctionComponent<PropsWithChildren<{ config: C }>>

// STORE
export declare const localStore: <T extends Record<string, unknown>>(
  key: string,
  defaultVal?: T,
) => LocalStore<T>
export type LocalStore<T extends Record<string, unknown>> = {
  get: () => T | null
  set: (data: T) => void
  delete: () => void
}
