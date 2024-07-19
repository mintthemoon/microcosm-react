import type { ChainData, Denom, Token, Tokens } from "$types"
import { fmtAmount } from "$util"
import type { Coin } from "@cosmjs/stargate"
import moize from "moize"

export const coinToToken = moize((coin: Coin, info: ChainData): Token => {
  const asset = info.getAsset(coin.denom)
  const amount = BigInt(coin.amount)
  if (!asset) {
    const displayAmount = fmtAmount(amount)
    return { denom: { base: coin.denom, exponent: 0 }, amount, displayAmount }
  }
  const displayAmount = fmtAmount(asset.scaleBase(amount))
  return { denom: asset as Denom, amount, displayAmount }
})

export const coinsToTokens = moize((coins: readonly Coin[], info: ChainData): Tokens => {
  return new Map<string, Token>(coins.map((coin) => {
    const token = coinToToken(coin, info)
    return [token.denom.symbol ?? token.denom.base, token]
  }))
})
