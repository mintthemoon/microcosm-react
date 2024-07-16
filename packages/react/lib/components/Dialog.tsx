import type { DialogProps } from "$types/components"
import { cn } from "$util"
import { forwardRef } from "react"
import "./Dialog.css"

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ children, title, className, ...props }, ref) => {
    return (
      <dialog ref={ref} className={cn("mc-dialog mc-component", className)} {...props}>
        <div className="mc-dialog-container">
          <section className="mc-dialog-content">
            <header>
              <h2>{title ?? "Dialog"}</h2>
              <form method="dialog" aria-label="Cancel dialog">
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
