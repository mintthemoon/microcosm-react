import type {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  DialogHTMLAttributes,
  FunctionComponent,
  PropsWithRef,
  ReactNode,
} from "react"

// MODAL
export declare const Modal: FunctionComponent<ModalProps>
export type ModalProps =
  & DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
  & { title?: string }

// DROPDOWN
export declare const Dropdown: FunctionComponent<DropdownProps>
export declare const DropdownItem: FunctionComponent<DropdownItemProps>
export type DropdownProps = PropsWithRef<{
  children: ReactNode
  className?: string
  triggerLabel?: ReactNode
  renderTrigger?: (open: () => void) => ReactNode
  align?: "start" | "end"
}>
export type DropdownItemProps =
  & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  & { closeDropdown?: boolean; children: React.ReactNode }


// WALLET
export declare const Wallet: FunctionComponent<WalletProps>
export type WalletProps = { featuredTokens?: string[]; align?: "start" | "end" }


// TOKENS
export declare const TokenIcon: FunctionComponent<TokenIconProps>
export type TokenIconProps = { symbol: string }
