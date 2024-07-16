import type { DetailedHTMLProps, DialogHTMLAttributes, ForwardedRef } from "react"

export interface DialogProps
  extends DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
{
  title?: string,
  animateClose?: boolean,
}

export type Dialog = ForwardedRef<HTMLDialogElement>
