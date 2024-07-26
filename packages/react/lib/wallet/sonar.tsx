import { Modal, Qrcode } from "$lib/components"
import { useStaticEffect, useStaticMutexFn, useWallet } from "$lib/hooks"
import { SonarLogo } from "$lib/wallet/logo"
import type { SonarConnectModalProps, SonarProviderProps, WalletConnectResult } from "$types"
import { noop } from "$util"
import type { AminoSignResponse, OfflineAminoSigner, StdSignDoc as AminoSignDoc } from "@cosmjs/amino"
import type { AccountData, DirectSignResponse, OfflineDirectSigner } from "@cosmjs/proto-signing"
import SignClient from "@walletconnect/sign-client"
import type { SessionTypes } from "@walletconnect/types"
import type { SignDoc as DirectSignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx"
import { forwardRef, useRef, useState } from "react"

const algo = "secp256k1"
const projectId = "fbda64846118d1a3487a4bfe3a6b00ac"

const sonarChainId = (chainId: string) => `cosmos:${chainId}`

const sonarParseAccounts = (accounts?: string[]): AccountData => {
  const account = accounts?.at(0)
  if (!account) throw new Error("Unable to find Sonar wallet account")
  const address = account.split(":").at(2)
  if (!address) throw new Error(`Unable to parse Sonar wallet account ${account}`)
  return { address, algo, pubkey: new Uint8Array() }
}

const sonarConnectParams = (chainId: string) => ({
  requiredNamespaces: { cosmos: { chains: [sonarChainId(chainId)], methods: [], events: [] } },
  optionalNamespaces: {
    cosmos: {
      chains: [sonarChainId(chainId)],
      methods: ["cosmos_signDirect", "cosmos_signAmino"],
      events: [],
    },
  },
})

type SonarOfflineSignerCfg = { chainId: string; signClient: SignClient; session: SessionTypes.Struct }

export const SonarOfflineSigner = (
  { chainId, signClient, session }: SonarOfflineSignerCfg,
): OfflineDirectSigner & OfflineAminoSigner => ({
  getAccounts: async (): Promise<
    readonly AccountData[]
  > => [sonarParseAccounts(session.namespaces.cosmos?.accounts)],
  signAmino: async (signerAddress: string, signDoc: AminoSignDoc): Promise<AminoSignResponse> =>
    signClient.request({
      topic: session.topic,
      chainId: sonarChainId(chainId),
      request: { method: "cosmos_signAmino", params: { signerAddress, signDoc } },
    }),
  signDirect: async (signerAddress: string, signDoc: DirectSignDoc): Promise<DirectSignResponse> =>
    signClient.request({
      topic: session.topic,
      chainId: sonarChainId(chainId),
      request: { method: "cosmos_signDirect", params: { signerAddress, signDoc } },
    }),
})

export const SonarProvider = ({ connectTimeout = 90000 }: SonarProviderProps) => {
  const [url, setUrl] = useState<string>()
  const modalRef = useRef<HTMLDialogElement | null>(null)
  const { register } = useWallet()

  const connect = useStaticMutexFn(
    async (chainId: string, updateSigner: (res: WalletConnectResult | Error) => void) => {
      try {
        if (chainId !== "kaiyo-1") {
          throw new Error("Sonar wallet does not support this chain (Kujira mainnet only)")
        }
        const signClient = await SignClient.init({ projectId })
        const params = sonarConnectParams(chainId)
        console.log("Sonar wallet connecting: ", params)
        const { uri: connectUrl, approval } = await signClient.connect(params)
        if (!connectUrl) throw new Error("Unable to connect to Sonar Wallet")
        setUrl(connectUrl)
        const modal = modalRef.current
        if (!modal) {
          throw new Error("Unable to show Sonar connect modal")
        }
        console.log("Sonar wallet requesting user approval: ", connectUrl)
        const userApproval = new Promise<SessionTypes.Struct>((_, reject) => {
          modal.onclose = () => reject(new Error("Sonar wallet connection canceled"))
          setTimeout(() => reject(new Error("Sonar wallet approval timed out")), connectTimeout)
        })
        modal.showModal()
        const session = await Promise.race([approval(), userApproval])
        console.log("Sonar wallet approved, acquired session!")
        const signer = SonarOfflineSigner({ chainId, signClient, session })
        updateSigner([signer, noop])
      } finally {
        if (modalRef.current?.open) {
          modalRef.current.close()
        }
      }
    },
  )

  useStaticEffect(() => register({ name: "Sonar", logo: SonarLogo, connect }))

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
