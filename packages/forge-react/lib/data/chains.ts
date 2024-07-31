import type { Asset, ChainData, ChainDefaults, FeeDenom } from "$types"
import type {
  Asset as RegistryAsset,
  AssetList as RegistryAssetList,
  Chain as RegistryChain,
  FeeToken as RegistryFeeToken,
} from "@chain-registry/v2-types"
import { assetList as mainnetAssets, chain as mainnetChain } from "@chain-registry/v2/mainnet/kujira"
import { assetList as testnetAssets, chain as testnetChain } from "@chain-registry/v2/testnet/kujiratestnet"
import type { ChainInfo as KujiraChainInfo } from "@keplr-wallet/types"
import { CHAIN_INFO as kujiraChainInfo, type NETWORK as KujiraNetwork } from "kujira.js/network"
import moize from "moize"
import { merge } from "object-deep-merge"

type RegistryChainData = { chain: RegistryChain; assetList: RegistryAssetList }

const registryChains = new Map<string, RegistryChainData>(
  [{ chain: mainnetChain, assetList: mainnetAssets }, { chain: testnetChain, assetList: testnetAssets }].map((
    c,
  ) => [c.chain.chainId, c]),
)

const chainDefaults = new Map<string, ChainDefaults>([
  ["kaiyo-1", { feeSymbol: "KUJI", gasAdjustment: 1.8 }],
  ["harpoon-4", { feeSymbol: "KUJI", gasAdjustment: 1.5 }],
])

const newAsset = (base: string, symbol: string | undefined, exponent: number, logoUrl?: string): Asset => {
  const scaleBase = moize((amount: bigint) => {
    return Number(amount) / 10 ** exponent
  })
  return { base, symbol, exponent, logoUrl, scaleBase }
}

const chainOverrides = new Map<string, Partial<ChainData>>([["harpoon-4", {
  fees: new Map<string, FeeDenom>([["KUJI", {
    base: "ukuji",
    symbol: "KUJI",
    exponent: 6,
    gasPrice: 0.0034,
  }]]),
  assets: new Map<string, Asset>([[
    "USK",
    newAsset("factory/kujira1r85reqy6h0lu02vyz0hnzhv5whsns55gdt4w0d7ft87utzk7u0wqr4ssll/uusk", "USK", 6),
  ]]),
}]])

const preprocessRegistryAssets = (registryAssets: RegistryAsset[]) => {
  const assets = new Map<string, Asset>()
  const symbols = new Map<string, string>()
  for (const { base, symbol, display, denomUnits, logoURIs } of registryAssets) {
    const baseUnit = denomUnits.find(unit => unit.denom === base)
    const displayUnit = denomUnits.find(unit => unit.denom === display)
    if (!baseUnit || !displayUnit) {
      console.warn(`Missing denom unit info for ${symbol}`)
      continue
    }
    const exponent = displayUnit.exponent - baseUnit.exponent
    const asset = newAsset(base, symbol, exponent, logoURIs?.png ?? undefined)
    assets.set(symbol, asset)
    symbols.set(base, symbol)
  }
  return { assets, symbols }
}

const preprocessRegistryFees = (
  registryFeeTokens: RegistryFeeToken[] | undefined,
  symbols: Map<string, string>,
  assets: Map<string, Asset>,
) => {
  if (!registryFeeTokens) {
    console.warn("Missing fee info from chain registry data")
    return { fees: undefined, firstFeeSymbol: undefined }
  }
  const fees = new Map<string, FeeDenom>()
  let firstFeeSymbol = null
  for (const feeDenom of registryFeeTokens) {
    const { denom, fixedMinGasPrice, lowGasPrice, averageGasPrice, highGasPrice } = feeDenom
    const gasPrice = averageGasPrice ?? highGasPrice ?? lowGasPrice
    if (!gasPrice) {
      console.warn(`Missing gas price for chain registry fee denom ${denom}`)
      continue
    }
    const symbol = symbols.get(denom)
    if (!symbol) {
      console.warn(`Missing asset symbol for chain registry fee denom ${denom}`)
      continue
    }
    const asset = assets.get(symbol)
    if (!asset) {
      console.warn(`Missing asset info for chain registry fee denom ${denom}`)
      continue
    }
    const { exponent } = asset
    fees.set(symbol, { base: denom, symbol, exponent, gasPrice, minGasPrice: fixedMinGasPrice })
    if (!firstFeeSymbol) {
      firstFeeSymbol = symbol
    }
  }
  return { fees, firstFeeSymbol }
}

const preprocessChainRegistryData = (chain: RegistryChainData) => {
  const { chain: registryInfo, assetList: { assets: registryAssets } } = chain
  const { chainId, prettyName: displayName, logoURIs, fees: registryFees } = registryInfo
  let defaults = chainDefaults.get(chainId)
  if (!defaults) {
    console.warn(`Missing cfg defaults for ${chainId}`)
  }
  const { assets, symbols } = preprocessRegistryAssets(registryAssets)
  const logoUrl = logoURIs?.png ?? undefined
  const { fees, firstFeeSymbol } = preprocessRegistryFees(registryFees?.feeTokens, symbols, assets)
  if (!defaults && firstFeeSymbol) {
    defaults = { feeSymbol: firstFeeSymbol, gasAdjustment: 1.5 }
  }
  return { chainId, displayName, logoUrl, assets, symbols, fees, defaults } as Partial<ChainData>
}

const preprocessKujiraNetworkData = (chainInfo: KujiraChainInfo) => {
  const { chainId, chainName: displayName, feeCurrencies: kujiraFees } = chainInfo
  const fees = new Map<string, FeeDenom>()
  const symbols = new Map<string, string>()
  const assets = new Map<string, Asset>()
  for (
    const { coinDenom: symbol, coinMinimalDenom: base, coinDecimals: exponent, gasPriceStep } of kujiraFees
  ) {
    const asset = newAsset(base, symbol, exponent)
    assets.set(symbol, asset)
    symbols.set(base, symbol)
    if (!gasPriceStep) continue
    const gasPrice = gasPriceStep.average
    const fee = { base, symbol, exponent, gasPrice }
    fees.set(symbol, fee)
  }
  return { chainId, displayName, assets, symbols, fees } as Partial<ChainData>
}
export const getChain = moize((chainId: string) => {
  const registryChain = registryChains.get(chainId)
  if (!registryChain) {
    throw new Error(`Chain ${chainId} not found in registry`)
  }
  const registryData = preprocessChainRegistryData(registryChain)
  const kujiraChain = kujiraChainInfo[chainId as KujiraNetwork]
  const kujiraData = kujiraChain ? preprocessKujiraNetworkData(kujiraChain) : {}
  const override = chainOverrides.get(chainId)
  const data = override ? merge(merge(registryData, kujiraData), override) : merge(registryData, kujiraData)
  const getAsset = moize((base: string) => {
    const symbol = data.symbols?.get(base)
    if (!symbol) return undefined
    return data.assets?.get(symbol)
  })
  return { ...data, getAsset } as ChainData
})

// preload
try {
  getChain("kaiyo-1")
  getChain("harpoon-4")
} catch (e) {
  console.error("Error processing chain data:", e)
}
