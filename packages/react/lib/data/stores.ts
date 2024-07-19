import type { WalletConnectionStoreData } from "$types"
import { localStore } from "$util"

export const WalletConnectionStore = localStore<WalletConnectionStoreData>("wallet-connection")
