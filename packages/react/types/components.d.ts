import type {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  DialogHTMLAttributes,
  FunctionComponent,
  PropsWithRef,
  ReactNode,
} from "react"
import type { QrCodeGenerateOptions } from "uqr"

// ======= MODAL =======
// BASE
export declare const Modal: FunctionComponent<ModalProps>
export type ModalProps =
  & DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
  & { title?: string }

// ======= DROPDOWN =======
export declare const Dropdown: FunctionComponent<DropdownProps>
export declare const DropdownItem: FunctionComponent<DropdownItemProps>
export type DropdownProps = PropsWithRef<
  {
    children: ReactNode
    className?: string
    triggerLabel?: ReactNode
    renderTrigger?: (open: () => void) => ReactNode
    align?: "start" | "end"
  }
>
export type DropdownItemProps =
  & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  & { closeDropdown?: boolean; children: React.ReactNode }

// ======= WALLET =======
export declare const WalletConnect: FunctionComponent<WalletConnectProps>
export type WalletConnectProps = { featuredTokens?: string[]; align?: "start" | "end" }

// ======= TOKENS =======
export declare const TokenIcon: FunctionComponent<TokenIconProps>
export type TokenIconProps = { symbol: string }

// ======= QRCODE =======
export declare const Qrcode: FunctionComponent<QrcodeProps>
export type QrcodeProps = {
  value: string
  options?: QrCodeGenerateOptions
  scale?: number
  colors?: [string, string]
}
