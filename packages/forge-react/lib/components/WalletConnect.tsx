import { useChain, useError, useWallet } from "$lib/hooks"
import type { Token, Tokens, Wallet, WalletConnectProps } from "$types"
import { fmtAddrLong, fmtAddrShort, fmtDenom } from "$util"
import { ChevronUpIcon, LinkSlashIcon, WalletIcon } from "@heroicons/react/24/outline"
import { forwardRef, useCallback, useEffect, useState } from "react"
import { Dropdown, DropdownItem } from "./Dropdown"
import { TokenIcon } from "./TokenIcon"
import "./WalletConnect.css"

export const WalletConnect = forwardRef<HTMLDialogElement, WalletConnectProps>(
  ({ featuredTokens, align }, ref) => {
    const { addr, isReady: isWalletReady, wallets, connect, disconnect } = useWallet()
    const { isReady: isChainReady, queryAddrTokens } = useChain()
    const { setError } = useError()
    const [tokens, setTokens] = useState<Tokens>()

    // TODO make these render funcs components
    const renderWalletTrigger = useCallback((open: () => void) => {
      return (
        <button type="button" onClick={open} className="vf-wallet-trigger">
          <WalletIcon className="vf-wallet-icon vf-wallet-trigger-icon" />
          {isWalletReady && addr ? fmtAddrShort(addr) : "Connect Wallet"}
        </button>
      )
    }, [isWalletReady, addr])

    const renderWalletSelect = useCallback(() => {
      if (!wallets) return null
      return Object.values(wallets).map((wallet: Wallet) => (
        <DropdownItem
          key={wallet.name}
          onClick={() => connect(wallet.name)}
          className="vf-wallet-wallet"
        >
          {typeof wallet.logo === "string" ? <img src={wallet.logo} alt={wallet.name} /> : wallet.logo()}
          {wallet.name}
        </DropdownItem>
      ))
    }, [connect, wallets])

    const renderToken = useCallback((token: Token) => {
      const displayName = token.denom.symbol ?? token.denom.base
      return (
        <DropdownItem className="vf-wallet-token" key={token.denom.symbol}>
          <TokenIcon symbol={token.denom.symbol ?? token.denom.base} />
          <span className="vf-wallet-token-amount">{token.displayAmount}</span>
          <span className="vf-wallet-token-symbol">{fmtDenom(displayName)}</span>
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
      if (!isWalletReady && wallets) {
        return renderWalletSelect()
      }
      return (
        <>
          <DropdownItem className="vf-wallet-addr">{fmtAddrLong(addr)}</DropdownItem>
          {renderTokens()}
          <DropdownItem onClick={disconnect} className="vf-wallet-disconnect" key="action_disconnect">
            <LinkSlashIcon className="vf-wallet-icon" />Disconnect
          </DropdownItem>
        </>
      )
    }, [isWalletReady, addr, wallets, renderTokens, renderWalletSelect, disconnect])

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
      <Dropdown ref={ref} renderTrigger={renderWalletTrigger} className="vf-wallet" align={align ?? "end"}>
        {renderDropdownContent()}
        <DropdownItem closeDropdown className="vf-wallet-close" key="action_close">
          <ChevronUpIcon className="vf-wallet-icon" />Close
        </DropdownItem>
      </Dropdown>
    )
  },
)
