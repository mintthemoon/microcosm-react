import type { Wallet } from "$types"
import { Registry } from "@cosmjs/proto-signing"
import { KeplrWallet } from "./keplr"
export { KeplrWallet }
export { KeplrLogo, SonarLogo } from "./logo"
export { SonarProvider } from "./sonar"
import { AminoTypes, createDefaultAminoConverters, defaultRegistryTypes } from "@cosmjs/stargate"
// wallets not needing to register (aka not Sonar)
export const StaticWallets: Record<string, Wallet> = { Keplr: KeplrWallet }
export const ProtoRegistry = new Registry(defaultRegistryTypes)
export const AminoConverters = createDefaultAminoConverters()
export const AminoRegistry = new AminoTypes(AminoConverters)
