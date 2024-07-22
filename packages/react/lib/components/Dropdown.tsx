import type { DropdownItemProps, DropdownProps } from "$types"
import { forwardRef, type MutableRefObject, useImperativeHandle, useRef } from "react"
import "./Dropdown.css"
import { cn } from "$util"

export const Dropdown = forwardRef<HTMLDialogElement, DropdownProps>(
  ({ children, triggerLabel, renderTrigger, align, className }, ref) => {
    const internalRef = useRef<HTMLDialogElement>(null) as MutableRefObject<HTMLDialogElement>
    useImperativeHandle(ref, () => internalRef.current)

    const open = () => {
      internalRef.current.show()
    }

    return (
      <div className={cn("mc-dropdown mc-base", className)}>
        {renderTrigger ?
          renderTrigger(open) :
          (
            <button type="button" onClick={open} className="mc-dropdown-trigger">
              {triggerLabel ?? "Open Dropdown"}
            </button>
          )}
        <dialog ref={internalRef} className={`mc-dropdown-dialog mc-dropdown-dialog-${align ?? "start"}`}>
          <menu className="mc-dropdown-content">{children}</menu>
        </dialog>
      </div>
    )
  },
)

export const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ children, closeDropdown, className, ...props }, ref) => {
    return (
      <li>
        {closeDropdown ?
          (
            <form method="dialog" aria-label="Close dropdown">
              <button ref={ref} type="submit" className={cn("mc-dropdown-item", className)} {...props}>
                {children}
              </button>
            </form>
          ) :
          (
            <button ref={ref} type="button" className={cn("mc-dropdown-item", className)} {...props}>
              {children}
            </button>
          )}
      </li>
    )
  },
)
