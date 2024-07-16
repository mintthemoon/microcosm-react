import type { DetailedHTMLProps, DialogHTMLAttributes, ForwardedRef } from "react"

export interface DialogProps
  extends DetailedHTMLProps<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>
{
  title?: string
}

export type Dialog = ForwardedRef<HTMLDialogElement>
