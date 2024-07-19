import type { PropsWithChildren } from "react"
import { type ChainConfig, ChainContextProvider } from "./chain"
import { type ErrorConfig, ErrorContextProvider } from "./error"
import { type WalletConfig, WalletContextProvider } from "./wallet"

export type MicrocosmConfig = ErrorConfig & ChainConfig & WalletConfig

export type MicrocosmProps = PropsWithChildren<MicrocosmConfig>

export const MicrocosmProvider = ({ children, ...config }: MicrocosmProps) => {
  return (
    <ErrorContextProvider config={config as ErrorConfig}>
      <ChainContextProvider config={config as ChainConfig}>
        <WalletContextProvider config={config as WalletConfig}>{children}</WalletContextProvider>
      </ChainContextProvider>
    </ErrorContextProvider>
  )
}
