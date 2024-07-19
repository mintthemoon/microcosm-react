import type { WalletProvider } from "$types"
import type { WalletState } from "$lib/contexts/wallet"

import { KeplrProvider } from "./keplr"

const providers = new Map<string, WalletProvider>([KeplrProvider].map((p) => [p.name, p]))

export const providerNames = Array.from(providers.keys())

export const getProvider = (name: string): WalletProvider | undefined => {
  return providers.get(name)
}

export const defaultWalletState: WalletState = {
  addr: undefined,
  account: undefined,
  stargateSignClient: undefined,
  provider: undefined,
  isReady: false,
}