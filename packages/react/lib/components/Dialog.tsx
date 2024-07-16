import type { DialogProps } from "$types/components"
import { cn } from "$util"
import {
  forwardRef,
  type MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import "./Dialog.css"

const AnimatedDialog = forwardRef<HTMLDialogElement, DialogProps>(({ children, ...props }, ref) => {
  const [isClosing, setIsClosing] = useState(false)
  const internalRef = useRef<HTMLDialogElement>() as MutableRefObject<HTMLDialogElement>

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs added to deps have no effect
  useImperativeHandle(ref, () => internalRef.current, [])

  // await is not necessary here, this should fire entirely in the background and not block the page render
  // eslint-disable-next-line @typescript-eslint/require-await
  const delayClose = useCallback(async (dialog: HTMLDialogElement) => {
    setTimeout(() => {
      dialog.classList.remove("mc-dialog-closing")
      dialog.close()
      setIsClosing(false)
    }, 150)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs added to deps have no effect
  useEffect(() => {
    const dialog = internalRef.current
    if (!(dialog instanceof HTMLDialogElement)) return
    const onMutate = (mutations: MutationRecord[]) => {
      if (mutations.find((m) => m.attributeName === "open")) {
        if (!dialog.open && !isClosing) {
          setIsClosing(true) // debounce
          dialog.showModal() // not quite yet
          dialog.classList.add("mc-dialog-closing") // trigger animation
          // ignoring the promise is intended, this function must return ASAP so page render can continue
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          delayClose(dialog) // close after animation is done
        }
      }
    }
    const observer = new MutationObserver(onMutate)
    observer.observe(dialog, { attributes: true })
    return () => {
      observer.disconnect()
    }
  }, [isClosing, delayClose, setIsClosing])

  return <dialog ref={internalRef} {...props}>{children}</dialog>
})

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ children, className, title, ...props }, ref) => {
    return (
      <AnimatedDialog ref={ref} className={cn("mc-dialog mc-component", className)} {...props}>
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
      </AnimatedDialog>
    )
  },
)
