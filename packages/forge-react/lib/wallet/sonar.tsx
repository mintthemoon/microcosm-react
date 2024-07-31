import { Modal, Qrcode } from "$lib/components"
import { useChain, useWallet } from "$lib/hooks"
import { type BroadcastingSigner, pollForTxDelivered } from "$lib/microcosm"
import { SonarLogo } from "$lib/wallet/logo"
import type { SonarConnectModalProps, SonarProviderProps, WalletConnectResult } from "$types"
import type { StdFee } from "@cosmjs/amino"
import type { AccountData, EncodeObject } from "@cosmjs/proto-signing"
import type { Account, DeliverTxResponse } from "@cosmjs/stargate"
import type { CometClient } from "@cosmjs/tendermint-rpc"
import { SignClient } from "@walletconnect/sign-client"
import type { EngineTypes, ISignClient, ProposalTypes, SessionTypes } from "@walletconnect/types"
import { fromByteArray, toByteArray } from "base64-js"
import { useDebounceEffect, useStaticMemo, useStaticMutexCb } from "devhooks"
import { forwardRef, useRef, useState } from "react"
import { ProtoRegistry } from "."

const algo = "secp256k1"
const projectId = "fbda64846118d1a3487a4bfe3a6b00ac"

const sonarChainId = (chainId: string) => `cosmos:${chainId}`

const sonarRequiredNamespaces = (chainId: string): ProposalTypes.RequiredNamespaces => ({
  cosmos: { chains: [sonarChainId(chainId)], methods: [], events: [] },
})
const sonarConnParams = (chainId: string): EngineTypes.ConnectParams => ({
  requiredNamespaces: sonarRequiredNamespaces(chainId),
  optionalNamespaces: {
    cosmos: { chains: [sonarChainId(chainId)], methods: ["cosmos_signDirect"], events: [] },
  },
})

const reason = { code: 0, message: "Connection closed" }
const sonarDisconnect = (signClient: ISignClient, topic: string) => () => {
  signClient.disconnect({ topic, reason })
}

const sonarAccountFromSession = async (
  session: SessionTypes.Struct,
  queryAccount: (addr: string) => Promise<Account | null | undefined>,
): Promise<Account> => {
  const address = session.namespaces.cosmos?.accounts?.at(0)?.split(":").at(2)
  if (!address) throw new Error("Unable to find Sonar wallet account address")
  const account = await queryAccount(address)
  if (account === null) throw new Error("Sonar wallet account not found on chain")
  if (account === undefined) throw new Error("Unable to query Sonar wallet account from chain")
  if (account.address !== address) throw new Error("Sonar wallet account address mismatch")
  return account
}

type SonarHybridSignerCfg = {
  chainId: string
  signClient: ISignClient
  session: SessionTypes.Struct
  account: Account
  cmtClient: CometClient
  defaultFeeDenom?: string
}

export const SonarHybridSigner = (
  { chainId, signClient, session, account, cmtClient, defaultFeeDenom }: SonarHybridSignerCfg,
): BroadcastingSigner => ({
  getAccounts: async (): Promise<readonly AccountData[]> => {
    if (!account.pubkey) throw new Error("Sonar wallet account missing pubkey")
    return [{ address: account.address, pubkey: toByteArray(account.pubkey.value), algo }]
  },
  signAndBroadcast: async (
    signerAddress: string,
    msgs: readonly EncodeObject[],
    fee: number | StdFee | "auto",
    memo: string,
    _timeoutHeight?: bigint,
  ): Promise<DeliverTxResponse> => {
    if (signerAddress !== account.address) throw new Error("Sonar wallet signer address mismatch")
    const feeDenom = typeof fee === "object" ? fee.amount.at(0)?.denom : defaultFeeDenom
    const params = {
      feeDenom,
      memo,
      msgs: msgs.map((msg) => {
        return { typeUrl: msg.typeUrl, value: fromByteArray(ProtoRegistry.encode(msg)) }
      }),
    }
    const txSigned = toByteArray(
      await signClient.request<string>({
        topic: session.topic,
        chainId: sonarChainId(chainId),
        request: { method: "cosmos_signDirect", params },
      }),
    )
    const broadcastRes = await cmtClient.broadcastTxSync({ tx: txSigned })
    return new Promise((resolve, reject) => {
      if (broadcastRes.code !== 0) {
        reject(new Error(`Sonar wallet tx broadcast failed: ${broadcastRes.log ?? "unknown error"}`))
      }
      pollForTxDelivered(broadcastRes.hash, cmtClient, resolve, reject)
    })
  },
})

export const SonarProvider = ({ connectTimeout = 90000 }: SonarProviderProps) => {
  const [url, setUrl] = useState<string>()
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const { register, wallets } = useWallet()
  const { queryAccount, info, microcosmClient } = useChain()

  const connect = useStaticMutexCb(
    async (chainId: string, updateSigner: (res: WalletConnectResult | Error) => void): Promise<void> => {
      try {
        if (chainId !== "kaiyo-1") {
          throw new Error("Sonar wallet does not support this chain (Kujira mainnet only)")
        }
        if (!microcosmClient) throw new Error("Unable to connect Sonar wallet; chain client not connected")
        const cmtClient = microcosmClient.clients.comet
        console.log("Sonar wallet connecting...")
        const defaultFeeSymbol = info?.defaults.feeSymbol
        const defaultFeeDenom = defaultFeeSymbol ? info.assets.get(defaultFeeSymbol)?.base : undefined
        if (!defaultFeeDenom) console.warn("Sonar wallet has no default fee denom configured")
        const connParams = sonarConnParams(chainId)
        const signClient = await SignClient.init({ projectId })
        const prevSession = signClient.find({ requiredNamespaces: sonarRequiredNamespaces(chainId) }).at(-1)
        if (prevSession) {
          console.log("Restoring previous Sonar wallet session...")
          const account = await sonarAccountFromSession(prevSession, queryAccount)
          const signer = SonarHybridSigner({
            chainId,
            signClient,
            session: prevSession,
            account,
            cmtClient,
            defaultFeeDenom,
          })
          updateSigner([signer, sonarDisconnect(signClient, prevSession.topic)])
          console.log("Sonar wallet connected!")
          return
        }
        const { uri: connectUrl, approval } = await signClient.connect(connParams)
        if (!connectUrl) throw new Error("Unable to connect to Sonar Wallet")
        setUrl(connectUrl)
        const modal = modalRef.current
        if (!modal) {
          throw new Error("Unable to show Sonar connect modal")
        }
        console.log("Sonar wallet requesting approval...")
        const userApproval = new Promise<SessionTypes.Struct>((_, reject) => {
          modal.onclose = () => reject(new Error("Sonar wallet connection canceled"))
          setTimeout(() => reject(new Error("Sonar wallet approval timed out")), connectTimeout)
        })
        modal.showModal()
        const session = await Promise.race([approval(), userApproval])
        const account = await sonarAccountFromSession(session, queryAccount)
        const signer = SonarHybridSigner({
          chainId,
          signClient,
          session,
          account,
          cmtClient,
          defaultFeeDenom,
        })
        updateSigner([signer, sonarDisconnect(signClient, session.topic)])
        console.log("Sonar wallet connected!")
      } finally {
        if (modalRef.current?.open) {
          modalRef.current.onclose = null
          modalRef.current.close()
        }
      }
    },
    [queryAccount, info],
  )

  const sonarWallet = useStaticMemo(() => ({ name: "Sonar", logo: SonarLogo, connect }), [connect])

  useDebounceEffect(() => {
    if (!wallets || !sonarWallet || Object.is(wallets.Sonar, sonarWallet)) return
    register(sonarWallet)
  }, [register, wallets, sonarWallet])

  return <SonarConnectModal ref={modalRef} url={url} title="Connect Sonar Wallet" />
}

export const SonarConnectModal = forwardRef<HTMLDialogElement, SonarConnectModalProps>(
  ({ url, ...props }: SonarConnectModalProps, ref) => {
    return (
      <Modal ref={ref} className="vf-sonar-connect" {...props}>
        {url ? <Qrcode value={url} scale={3} /> : <p>Missing WalletConnect URL!</p>}
      </Modal>
    )
  },
)
