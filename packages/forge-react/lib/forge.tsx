import { ChainProvider, ErrorProvider, WalletProvider } from "$lib/hooks"
import type { ChainCfg, DeepcometForgeProviderProps, ErrorCfg, WalletCfg } from "$types"

export const DeepcometForge = ({ children, ...cfg }: DeepcometForgeProviderProps) => {
  return (
    <ErrorProvider cfg={cfg as ErrorCfg}>
      <ChainProvider cfg={cfg as ChainCfg}>
        <WalletProvider cfg={cfg as WalletCfg}>{children}</WalletProvider>
      </ChainProvider>
    </ErrorProvider>
  )
}
