import { toHex } from "@cosmjs/encoding"
import { type DeliverTxResponse, fromTendermintEvent } from "@cosmjs/stargate"
import type { CometClient, tendermint37, TxSearchResponse as Tm34TxSearchRes } from "@cosmjs/tendermint-rpc"
import { TxMsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci"

type Tm37TxSearchRes = tendermint37.TxSearchResponse
type CmtTxSearchRes = Tm34TxSearchRes | Tm37TxSearchRes

export const txSearchResToDeliverTxRes = (res: CmtTxSearchRes): DeliverTxResponse | null => {
  if (res.txs.length !== 1 || !res.txs[0]) return null
  const [tx] = res.txs
  const msgData = TxMsgData.decode(tx.result.data ?? new Uint8Array())
  return {
    code: tx.result.code,
    height: tx.height,
    txIndex: tx.index,
    events: tx.result.events.map(fromTendermintEvent),
    rawLog: tx.result.log ?? "",
    transactionHash: toHex(tx.hash).toUpperCase(),
    msgResponses: msgData.msgResponses,
    gasUsed: tx.result.gasUsed,
    gasWanted: tx.result.gasWanted,
  }
}

export const pollForTxDelivered = (
  hash: string | Uint8Array,
  cmtClient: CometClient,
  cb: (res: DeliverTxResponse) => void,
  errorCb: (err: Error) => void,
  interval = 250,
  timeout = 12000,
) => {
  try {
    const hashStr = typeof hash === "string" ? hash : toHex(hash).toUpperCase()
    const pollTimer = setInterval(async () => {
      const searchRes = await cmtClient.txSearchAll({ query: `tx.hash='${hashStr}'` })
      const deliverRes = txSearchResToDeliverTxRes(searchRes)
      if (deliverRes !== null) {
        clearInterval(pollTimer)
        cb(deliverRes)
      }
    }, interval)
    setTimeout(() => {
      clearInterval(pollTimer)
      errorCb(new Error(`Timed out waiting for tx delivery: ${hashStr}`))
    }, timeout)
  } catch (err: unknown) {
    errorCb(err as Error)
  }
}
