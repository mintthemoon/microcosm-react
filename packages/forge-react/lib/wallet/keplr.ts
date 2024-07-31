import type { HybridSigner } from "$lib/microcosm/client"
import type { Wallet } from "$types"
import { KeplrLogo } from "./logo"

export const KeplrWallet: Wallet = {
  name: "Keplr",
  logo: KeplrLogo,
  connect: async (
    chainId: string,
    updateSigner: (data: [HybridSigner, (() => void)?] | Error) => void,
  ): Promise<void> => {
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
    console.log("Keplr wallet connected!")
  },
}
