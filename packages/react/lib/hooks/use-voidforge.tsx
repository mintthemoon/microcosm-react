import type { ChainCfg, ErrorCfg, VoidforgeProviderProps, WalletCfg } from "$types"
import { ChainProvider } from "./use-chain"
import { ErrorProvider } from "./use-error"
import { WalletProvider } from "./use-wallet"

export const Voidforge = ({ children, ...cfg }: VoidforgeProviderProps) => {
  return (
    <ErrorProvider cfg={cfg as ErrorCfg}>
      <ChainProvider cfg={cfg as ChainCfg}>
        <WalletProvider cfg={cfg as WalletCfg}>{children}</WalletProvider>
      </ChainProvider>
    </ErrorProvider>
  )
}
