import type { Wallet } from "$types"
import { KeplrProvider } from "./keplr"
export { KeplrProvider }
export { KeplrLogo, SonarLogo } from "./logo"
export { SonarProvider } from "./sonar"
// wallets not needing to register (aka not Sonar)
export const StaticWallets: Record<string, Wallet> = { Keplr: KeplrProvider }
