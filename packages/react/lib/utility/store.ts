import type { LocalStore } from "$types"

export const localStore = <T extends Record<string, unknown>>(key: string, defaultVal?: T): LocalStore<T> => ({
  get: () => {
    const data = localStorage.getItem(key)
    if (!data) return defaultVal ?? null
    return JSON.parse(data) as T
  },
  set: (data: T) => {
    localStorage.setItem(key, JSON.stringify(data))
  },
  delete: () => {
    localStorage.removeItem(key)
  },
})
