import type { Wallet } from "$types"
import type { OfflineSigner } from "@cosmjs/proto-signing"
import { KeplrLogo } from "./logo"

declare global {
  interface Window {
    keplr?: {
      enable: (chainId: string) => Promise<void>
      getOfflineSigner: (chainId: string) => OfflineSigner
    }
  }
}

export const KeplrProvider: Wallet = {
  name: "Keplr",
  logo: KeplrLogo,
  connect: async (
    chainId: string,
    updateSigner: (data: [OfflineSigner, (() => void)?] | Error) => void,
  ): Promise<void> => {
    console.log("KeplrProvider connect")
    if (!window.keplr) {
      throw new Error("Keplr extension is not installed")
    }
    await window.keplr.enable(chainId)
    const signer = window.keplr.getOfflineSigner(chainId)
    const onAddrChange = () => {
      if (!window.keplr) {
        updateSigner(new Error("Keplr extension is not installed"))
        return
      }
      const signer = window.keplr.getOfflineSigner(chainId)
      updateSigner([signer])
    }
    window.addEventListener("keplr_keystorechange", onAddrChange)
    const cleanup = () => window.removeEventListener("keplr_keystorechange", onAddrChange)
    updateSigner([signer, cleanup])
  },
}
