import type { ChainConfig, ErrorConfig, MicrocosmProps, WalletConfig } from "$types"
import { ChainContextProvider } from "./ctx-chain"
import { ErrorContextProvider } from "./ctx-error"
import { WalletContextProvider } from "./ctx-wallet"

export const MicrocosmProvider = ({ children, ...config }: MicrocosmProps) => {
  return (
    <ErrorContextProvider config={config as ErrorConfig}>
      <ChainContextProvider config={config as ChainConfig}>
        <WalletContextProvider config={config as WalletConfig}>{children}</WalletContextProvider>
      </ChainContextProvider>
    </ErrorContextProvider>
  )
}
