import type { ModalProps } from "$types"
import { cn } from "$util"
import { forwardRef } from "react"
import "./Modal.css"

export const Modal = forwardRef<HTMLDialogElement, ModalProps>(
  ({ children, className, title, ...props }, ref) => {
    return (
      <dialog ref={ref} className={cn("vf-modal vf-base", className)} {...props}>
        <div className="vf-modal-container">
          <section className="vf-modal-content">
            <header>
              <h2>{title ?? "Modal Dialog"}</h2>
              <form method="dialog" aria-label="Cancel modal">
                <button type="submit">Cancel</button>
              </form>
            </header>
            {children}
          </section>
        </div>
      </dialog>
    )
  },
)
