import { useCallback, useState } from "react"

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
  return { res, err, isReady, fn }
}
