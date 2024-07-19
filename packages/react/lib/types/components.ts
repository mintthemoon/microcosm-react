import type {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  DialogHTMLAttributes,
  ForwardedRef,
  FunctionComponent,
  ReactNode,
} from "react"

// DIALOG
export type Dialog = ForwardedRef<HTMLDialogElement>

export type DialogProps =
  & DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
  & { title?: string }

// DROPDOWN
export type DropdownProps = {
  children: ReactNode
  className?: string
  triggerLabel?: ReactNode
  triggerRender?: (open: () => void) => ReactNode
  align?: "start" | "end"
}

export type Dropdown = ForwardedRef<HTMLDialogElement>

export type DropdownItemProps =
  & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  & { closeDropdown?: boolean; children: React.ReactNode }

export type DropdownItem = ForwardedRef<HTMLButtonElement>

// WALLET
export type WalletProps = { featuredTokens?: string[]; align?: "start" | "end" }

export type Wallet = ForwardedRef<HTMLDialogElement>

// TOKENS
export type TokenIconProps = { symbol: string }

export type TokenIcon = FunctionComponent<TokenIconProps>
