import type { LocalStoreState, UnknownRecord } from "$types"
import { depsChanged, shallowMerge } from "$util"
import { debounce, type DebouncedFunc } from "lodash"
import { type DependencyList, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"

export const useAsync = <A extends unknown[], R>(
  fnAsync: (...args: A) => Promise<R>,
  onError?: (err: Error) => void,
) => {
  const [res, setRes] = useState<R | undefined>(undefined)
  const [err, setErr] = useState<Error | undefined>(undefined)
  const [isReady, setIsReady] = useState(false)
  const fn = useCallback((...args: A) => {
    void fnAsync(...args).then(setRes).catch((err: unknown) => {
      onError?.(err as Error)
      setErr(err as Error)
    }).finally(() => setIsReady(true))
  }, [fnAsync, onError])
  return [res, err, isReady, fn]
}

export const useAutoReducer = <S extends UnknownRecord>(initVal: S) =>
  useReducer(
    (state: S, action: Partial<S> | ((prev: S) => Partial<S>)): S =>
      shallowMerge(state, typeof action === "function" ? action(state) : action),
    initVal,
  )

export const useCurrentRef = <T>(val: T) => {
  const ref = useRef(val)
  ref.current = val
  return ref
}

export const useDebounce = <T>(val: T, dur = 300): T => {
  const [debounced, setDebounced] = useState(val)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(val), dur)
    return () => clearTimeout(timer)
  }, [val, dur])
  return debounced
}

export const useDebounceFn = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  fn: F,
  dur = 300,
): DebouncedFunc<F> => {
  const ref = useCurrentRef(fn)
  return useMemo(() => debounce((...args: Parameters<F>): ReturnType<F> => ref.current(...args), dur), [
    dur,
    ref.current,
  ])
}

export const useLocalStore = (key: string, initVal?: string) => {
  const [state, dispatch] = useAutoReducer<LocalStoreState>({ key })

  const setStore = useCallback((val: string) => {
    localStorage.setItem(state.key, val)
    dispatch({ val })
  }, [dispatch, state.key])

  const clearStore = useCallback(() => {
    localStorage.removeItem(state.key)
    dispatch({ val: null })
  }, [dispatch, state.key])

  const onStoreEvent = useCallback((ev: StorageEvent) => {
    if (ev.key === state.key && ev.newValue !== state.val) {
      dispatch({ val: ev.newValue })
    }
  }, [dispatch, state.key, state.val])

  useEffect(() => {
    let val = localStorage.getItem(state.key)
    if (!val && initVal) {
      localStorage.setItem(state.key, initVal)
      val = initVal
    }
    dispatch({ val })
    window.addEventListener("storage", onStoreEvent)
    return () => window.removeEventListener("storage", onStoreEvent)
  }, [dispatch, onStoreEvent, state.key, initVal])

  return { ...state, setStore, clearStore, onStoreEvent }
}

export const useMutexFn = <F extends (...args: Parameters<F>) => Promise<void>>(fn: F) => {
  const lockRef = useRef(false)
  return useCallback(async (...args: Parameters<F>): Promise<void> => {
    if (lockRef.current) return
    lockRef.current = true
    try {
      await fn(...args)
    } finally {
      lockRef.current = false
    }
  }, [fn])
}

export const useStaticMutexFn = <F extends (...args: Parameters<F>) => Promise<void>>(fn: F) => {
  const lockRef = useRef(false)
  return useStaticFn(async (...args: Parameters<F>): Promise<void> => {
    if (lockRef.current) return
    lockRef.current = true
    try {
      await fn(...args)
    } finally {
      lockRef.current = false
    }
  })
}

export const useStaticMemo = <T>(gen: () => T, deps: DependencyList): T => {
  const ref = useRef<{ val?: T; deps: DependencyList; init: boolean }>({ deps, init: true })
  if (!ref.current.init || depsChanged(ref.current.deps, deps)) {
    ref.current.val = gen()
    ref.current.deps = deps
    ref.current.init = false
  }
  return ref.current.val as T
}

export const useStaticFn = <F extends (...args: Parameters<F>) => ReturnType<F>>(fn: F): F => {
  const ref = useRef<F>(fn)
  ref.current = useMemo<F>(() => fn, [fn])
  const staticRef = useRef<(...args: Parameters<F>) => ReturnType<F>>()
  if (!staticRef.current) {
    staticRef.current = (...args: Parameters<F>): ReturnType<F> => ref.current(...args)
  }
  return staticRef.current as F
}

export const useStaticEffect = (fn: () => void) => useEffect(useStaticFn(fn), [])
