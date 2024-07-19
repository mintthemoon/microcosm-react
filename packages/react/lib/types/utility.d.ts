// STORE
export type LocalStore<T extends Record<string, unknown>> = {
  get: () => T | null
  set: (data: T) => void
  delete: () => void
}
