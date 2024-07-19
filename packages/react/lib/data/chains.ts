import type { Asset, ChainData, ChainDefaults, FeeDenom } from "$types"
import type { AssetList as RegistryAssetList, Chain as RegistryChainInfo } from "@chain-registry/types"
import { assets as mainnetAssets, chain as mainnetChain } from "chain-registry/mainnet/kujira"
import { assets as testnetAssets, chain as testnetChain } from "chain-registry/testnet/kujiratestnet"
import moize from "moize"

type RegistryChain = { chain: RegistryChainInfo; assets: RegistryAssetList }

const registryChains = new Map<string, RegistryChain>(
  [{ chain: mainnetChain, assets: mainnetAssets }, { chain: testnetChain, assets: testnetAssets }].map((
    c,
  ) => [c.chain.chain_id, c]),
)

const chainDefaults = new Map<string, ChainDefaults>([
  ["kaiyo-1", { feeSymbol: "KUJI", gasAdjustment: 1.8 }],
  ["harpoon-4", { feeSymbol: "KUJI", gasAdjustment: 1.5 }],
])

const chainOverrides = new Map<string, Partial<ChainData>>([["harpoon-4", {
  fees: new Map<string, FeeDenom>([["KUJI", {
    base: "ukuji",
    symbol: "KUJI",
    exponent: 6,
    gasPrice: 0.0034,
  }]]),
}]])

const preprocessChainRegistryData = (chain: RegistryChain) => {
  const { chain: registryInfo, assets: { assets: registryAssets } } = chain
  const {
    chain_id: chainId,
    pretty_name: displayName,
    chain_name: registryName,
    logo_URIs,
    fees: registryFees,
  } = registryInfo
  let defaults = chainDefaults.get(chainId)
  if (!defaults) {
    console.warn(`Missing config defaults for ${chainId}`)
  }
  const assets = new Map<string, Asset>()
  const symbols = new Map<string, string>()
  for (const asset of registryAssets) {
    const { base, symbol, display, denom_units, logo_URIs } = asset
    const baseUnit = denom_units.find(unit => unit.denom === base)
    const displayUnit = denom_units.find(unit => unit.denom === display)
    if (!baseUnit || !displayUnit) {
      console.warn(`Missing denom unit info for ${symbol} (${chainId})`)
      continue
    }
    const exponent = displayUnit.exponent - baseUnit.exponent
    const scaleBase = moize((amount: bigint) => {
      return Number(amount) / 10 ** exponent
    })
    assets.set(symbol, {
      base,
      symbol,
      exponent,
      logoUrl: logo_URIs?.png ?? logo_URIs?.jpeg ?? undefined,
      scaleBase,
    })
    symbols.set(base, symbol)
  }
  const logoUrl = logo_URIs?.png ?? logo_URIs?.jpeg ?? undefined
  if (!registryFees?.fee_tokens) {
    throw new Error(`Missing fee info from chain registry data for ${chainId} (${registryName})`)
  }
  const fees = new Map<string, FeeDenom>()
  let defaultFeeSymbol = defaults?.feeSymbol
  for (const feeDenom of registryFees.fee_tokens) {
    const { denom, fixed_min_gas_price, low_gas_price, average_gas_price, high_gas_price } = feeDenom

    const gasPrice = average_gas_price ?? high_gas_price ?? low_gas_price
    if (!gasPrice) {
      console.warn(`Missing gas price for fee denom ${denom} (${chainId})`)
      continue
    }
    const symbol = symbols.get(denom)
    if (!symbol) {
      console.warn(`Missing asset symbol for fee denom ${denom} (${chainId})`)
      continue
    }
    const asset = assets.get(symbol)
    if (!asset) {
      console.warn(`Missing asset info for fee denom ${denom} (${chainId})`)
      continue
    }
    const { exponent } = asset
    fees.set(symbol, { base: denom, symbol, exponent, gasPrice, minGasPrice: fixed_min_gas_price })
    if (!defaults && !defaultFeeSymbol) {
      defaultFeeSymbol = symbol
    }
  }
  if (!defaults) {
    if (!defaultFeeSymbol) {
      throw new Error(`No valid fee denoms found for ${chainId} (${registryName})`)
    }
    defaults = { feeSymbol: defaultFeeSymbol, gasAdjustment: 1.5 }
  }
  const getAsset = moize((base: string) => {
    const symbol = symbols.get(base)
    if (!symbol) return undefined
    return assets.get(symbol)
  })
  const override = chainOverrides.get(chainId)
  return { chainId, displayName, logoUrl, assets, symbols, fees, defaults, getAsset, ...override } as ChainData
}

export const getChain = moize((chainId: string) => {
  const registryChain = registryChains.get(chainId)
  if (!registryChain) {
    throw new Error(`Chain ${chainId} not found in registry`)
  }
  const data = preprocessChainRegistryData(registryChain)
  console.log("getChain", chainId, data)
  return data
})
