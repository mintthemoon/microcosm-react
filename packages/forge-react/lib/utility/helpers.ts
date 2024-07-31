import type { UnknownRecord } from "$types"

export const unwrap = <T>(val: T | undefined | null) => {
  if (!val) throw new Error("Expected value is null or undefined")
  return val
}

export const noop = () => {}

export const shallowMerge = <T extends UnknownRecord, U extends T | Partial<T> | undefined>(
  init: T,
  ...objs: U[]
): T => objs.reduce((acc: T, obj: U) => obj ? Object.assign(acc, obj) : acc, { ...init })
