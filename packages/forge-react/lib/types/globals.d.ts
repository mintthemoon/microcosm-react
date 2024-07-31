import type { KeplrInterface } from "$types"

declare global {
  interface Window {
    keplr?: KeplrInterface
  }
}
