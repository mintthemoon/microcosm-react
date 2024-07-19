export type LocalStore<T extends Record<string, unknown>> = {
  get: () => T | null;
  set: (data: T) => void;
  delete: () => void;
}

export const localStore = <T extends Record<string, unknown>>(key: string) => ({
  get: () => {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  },
  set: (data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
  delete: () => {
    localStorage.removeItem(key);
  }
})