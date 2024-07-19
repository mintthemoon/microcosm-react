import type { WalletProvider } from "$lib/types"
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

export const KeplrProvider: WalletProvider = {
  name: "Keplr",
  logo: KeplrLogo,
  connect: async (
    chainId: string,
    signerCb: (signer: OfflineSigner | undefined) => void,
    errorCb: (err: Error) => void,
  ) => {
    console.log("KeplrProvider connect")
    if (!window.keplr) {
      throw new Error("Keplr extension is not installed")
    }
    await window.keplr.enable(chainId)
    const signer = window.keplr.getOfflineSigner(chainId)
    signerCb(signer)
    const onAddrChange = () => {
      if (!window.keplr) {
        errorCb(new Error("Keplr extension is not installed"))
        signerCb(undefined)
        return
      }
      const signer = window.keplr.getOfflineSigner(chainId)
      signerCb(signer)
    }
    window.addEventListener("keplr_keystorechange", onAddrChange)
    return () => {
      window.removeEventListener("keplr_keystorechange", onAddrChange)
    }
  },
}
