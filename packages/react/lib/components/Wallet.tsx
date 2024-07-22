import { useChain, useError, useWallet } from "$lib/contexts"
import { getProvider, providerNames } from "$lib/wallet"
import type { Token, Tokens, WalletProps } from "$types"
import { fmtAddrLong, fmtAddrShort, fmtDenom } from "$util"
import { ChevronUpIcon, LinkSlashIcon, WalletIcon } from "@heroicons/react/24/outline"
import { forwardRef, useCallback, useEffect, useState } from "react"
import { Dropdown, DropdownItem } from "./Dropdown"
import { TokenIcon } from "./TokenIcon"
import "./Wallet.css"

export const Wallet = forwardRef<HTMLDialogElement, WalletProps>(({ featuredTokens, align }, ref) => {
  const { addr, isReady: isWalletReady, connect, disconnect } = useWallet()
  const { isReady: isChainReady, queryAddrTokens } = useChain()
  const { setError } = useError()
  const [tokens, setTokens] = useState<Tokens>()

  // TODO make these render funcs components
  const renderWalletTrigger = useCallback((open: () => void) => {
    return (
      <button type="button" onClick={open} className="mc-wallet-trigger">
        <WalletIcon className="mc-wallet-icon mc-wallet-trigger-icon" />
        {isWalletReady && addr ? fmtAddrShort(addr) : "Connect Wallet"}
      </button>
    )
  }, [isWalletReady, addr])

  const renderProviderSelect = useCallback((name: string) => {
    const provider = getProvider(name)
    if (!provider) return null
    return (
      <DropdownItem
        key={name}
        onClick={() => {
          connect(name)
        }}
        className="mc-wallet-provider"
      >
        {typeof provider.logo === "string" ? <img src={provider.logo} alt={name} /> : provider.logo()}
        {name}
      </DropdownItem>
    )
  }, [connect])

  const renderToken = useCallback((token: Token) => {
    const displayName = token.denom.symbol ?? token.denom.base
    return (
      <DropdownItem className="mc-wallet-token">
        <TokenIcon symbol={token.denom.symbol ?? token.denom.base} />
        <span className="mc-wallet-token-amount">{token.displayAmount}</span>
        <span className="mc-wallet-token-symbol">{fmtDenom(displayName)}</span>
      </DropdownItem>
    )
  }, [])

  const renderTokens = useCallback(() => {
    if (!tokens) return null
    const displayTokens: Token[] = featuredTokens ?
      featuredTokens.map((t) => tokens.get(t)).filter((t) => t !== undefined) :
      Array.from(tokens.values()).slice(0, 5)
    return displayTokens.map(renderToken)
  }, [tokens, featuredTokens, renderToken])

  const renderDropdownContent = useCallback(() => {
    if (!isWalletReady) {
      return <>{providerNames.map((name) => renderProviderSelect(name))}</>
    }
    return (
      <>
        <DropdownItem className="mc-wallet-addr">{fmtAddrLong(addr)}</DropdownItem>
        {renderTokens()}
        <DropdownItem onClick={disconnect} className="mc-wallet-disconnect">
          <LinkSlashIcon className="mc-wallet-icon" />Disconnect
        </DropdownItem>
      </>
    )
  }, [isWalletReady, addr, renderTokens, renderProviderSelect, disconnect])

  const fetchTokens = useCallback(async () => {
    if (!isChainReady || !addr) return
    const tokens = await queryAddrTokens(addr)
    if (tokens) {
      setTokens(tokens)
    }
  }, [isChainReady, addr, queryAddrTokens])

  useEffect(() => {
    void fetchTokens().catch((err: unknown) => {
      setError(err as Error)
    })
  }, [fetchTokens, setError])

  return (
    <Dropdown ref={ref} renderTrigger={renderWalletTrigger} className="mc-wallet" align={align ?? "end"}>
      {renderDropdownContent()}
      <DropdownItem closeDropdown className="mc-wallet-close">
        <ChevronUpIcon className="mc-wallet-icon" />Close
      </DropdownItem>
    </Dropdown>
  )
})
