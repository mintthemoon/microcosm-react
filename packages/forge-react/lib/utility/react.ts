import { type ClassValue, clsx } from "clsx"
import type { DependencyList } from "react"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(...inputs))
}

export const depsChanged = (a: DependencyList, b: DependencyList): boolean => {
  if (a === b) return false
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return true
  }
  return false
}
