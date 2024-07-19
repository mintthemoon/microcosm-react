import type { PropsWithChildren } from "react"
import type { ChainConfig } from "./chain"
import type { ErrorConfig } from "./error"
import type { WalletConfig } from "./wallet"

export type MicrocosmConfig = ErrorConfig & ChainConfig & WalletConfig

export type MicrocosmProps = PropsWithChildren<MicrocosmConfig>
