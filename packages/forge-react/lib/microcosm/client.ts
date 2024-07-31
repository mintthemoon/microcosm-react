import type { AccountData, OfflineAminoSigner, StdFee } from "@cosmjs/amino"
import { CosmWasmClient, SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate"
import type { EncodeObject, OfflineDirectSigner } from "@cosmjs/proto-signing"
import { type DeliverTxResponse, SigningStargateClient, StargateClient } from "@cosmjs/stargate"
import { type CometClient, connectComet } from "@cosmjs/tendermint-rpc"
import moize from "moize"

export type BroadcastingSigner = {
  getAccounts: () => Promise<readonly AccountData[]>
  signAndBroadcast: (
    signerAddress: string,
    msgs: readonly EncodeObject[],
    fee: number | StdFee | "auto",
    memo: string,
    timeoutHeight?: bigint,
  ) => Promise<DeliverTxResponse>
}

export type HybridSigner = OfflineAminoSigner | OfflineDirectSigner | BroadcastingSigner

export type MicrocosmClientCfg = { rpcUrl: string }
export type MicrocosmClientFactoryCfg = { cmtClient: CometClient }
export type MicrocosmClientInterface = { clients: MicrocosmClientFactoryInterface }
export type MicrocosmClientFactoryInterface = {
  comet: CometClient
  stargate: () => Promise<StargateClient>
  cosmwasm: () => Promise<CosmWasmClient>
  signingStargate: (signer: HybridSigner) => Promise<SigningStargateClient>
  signingCosmwasm: (signer: HybridSigner) => Promise<SigningCosmWasmClient>
}

export const isBroadcastingSigner = (signer: HybridSigner): signer is BroadcastingSigner => {
  return typeof (signer as BroadcastingSigner).signAndBroadcast === "function"
    && typeof signer.getAccounts === "function"
}

export const DummyOfflineSigner = (signer: BroadcastingSigner): OfflineDirectSigner => ({
  getAccounts: signer.getAccounts,
  signDirect: async () => {
    throw new Error("signDirect should not be called with a BroadcastingSigner")
  },
})

export const MicrocosmClient = async ({ rpcUrl }: MicrocosmClientCfg) => ({
  clients: MicrocosmClientFactory({ cmtClient: await connectComet(rpcUrl) }),
})

export const MicrocosmClientFactory = ({ cmtClient }: MicrocosmClientFactoryCfg) => ({
  comet: cmtClient,
  stargate: moize(async (): Promise<StargateClient> => await StargateClient.create(cmtClient)),
  cosmwasm: moize(async (): Promise<CosmWasmClient> => await CosmWasmClient.create(cmtClient)),
  signingStargate: moize(async (signer: HybridSigner): Promise<SigningStargateClient> => {
    if (!isBroadcastingSigner(signer)) return await SigningStargateClient.createWithSigner(cmtClient, signer)
    const sgSignClient = await SigningStargateClient.createWithSigner(cmtClient, DummyOfflineSigner(signer))
    sgSignClient.signAndBroadcast = signer.signAndBroadcast
    sgSignClient.signAndBroadcastSync = () => {
      throw new Error("signAndBroadcastSync not supported with a BroadcastingSigner")
    }
    return sgSignClient
  }),
  signingCosmwasm: moize(async (signer: HybridSigner): Promise<SigningCosmWasmClient> => {
    if (!isBroadcastingSigner(signer)) return await SigningCosmWasmClient.createWithSigner(cmtClient, signer)
    const cwSignClient = await SigningCosmWasmClient.createWithSigner(cmtClient, DummyOfflineSigner(signer))
    cwSignClient.signAndBroadcast = signer.signAndBroadcast
    cwSignClient.signAndBroadcastSync = () => {
      throw new Error("signAndBroadcastSync not supported with a BroadcastingSigner")
    }
    return cwSignClient
  }),
})
