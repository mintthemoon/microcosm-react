import type { ClassValue } from "clsx"

// REACT
export declare const cn: (...args: ClassValue[]) => string
export type PropsWithoutChildren<P> = Omit<P, "children">

// FMT
export declare const truncStr: (str: string | undefined, frontChars: number, backChars: number) => string
export declare const fmtAddrShort: (addr?: string) => string
export declare const fmtAddrLong: (addr?: string) => string
export declare const fmtDenom: (denom: string) => string
export declare const fmtAmount: (amount: bigint | number) => string

// HELPERS (just some generally helpful types)
export type EmptyRecord = Record<never, never>
export type UnknownKey = string | number | symbol
export type UnknownRecord = Record<UnknownKey, unknown>
export type Subset<T> = Partial<T> | T
export type Range<S extends number, E extends number, A extends unknown[] = [], R extends number = never> =
  A["length"] extends E ? R | S | E : Range<S, E, [...A, 1], A[S] extends undefined ? R : R | A["length"]>
