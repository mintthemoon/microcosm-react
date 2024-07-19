import type { DialogProps } from "$types"
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
import "./Modal.css"

// if you're squinting at this thinking "this can't be the best way", I'm right there with you
// the HTML5 dialog element turns out to be very difficult to animate properly without losing functionality
// this solution animates both the dialog and its backdrop, both opening and closing
// what makes this tricky is the `::backdrop` pseudo-element which only exists while the dialog is open
// as soon as `close` is called it's entirely removed from the DOM, making it quite a pain to animate
// also, the dialog emits an "open" event but no "close", which doesn't help us
// previous attempts that didn't quite work:
//   1. wrap the dialog `close` function and implement the delay before calling the real `close()`
//   2. bind the dialog's `open` prop to a `useState` var and manage it manually
// and their pitfalls:
//   1. this does not affect closing the dialog by pressing Esc
//   2. this prevents closing the dialog by pressing Esc because the prop is bound to our state
// so, the solution:
//   - open animation is fully handled by CSS, a pain to figure out but works fine.
//     it is necessary to set `display: flex` on the dialog as some browsers force `display: none`
//     when it closes. since that means it's technically always rendered, we also need
//     to prevent it swallowing clicks by toggling the `pointer-events` value.
//   - instead of wrapping `close` since not all methods for closing would call our function,
//     we observe mutations on the dialog so we can catch when it's closing. we delay the close
//     by calling `showModal` to re-open it, then call `close` once more after we've waited for the animation.
//     this works without any flicker as `onMutate` runs between the state changing and the next page render.
//   - we use an async callback for the delay, and intentionally ignore the Promise it returns because
//     even `setTimeout` takes a bit too long to be blocking the main loop with it.
// if you've got a better method which addresses those issues I'd love to see the PR :)
const AnimatedModal = forwardRef<HTMLDialogElement, DialogProps>(({ children, ...props }, ref) => {
  const [isClosing, setIsClosing] = useState(false)
  const internalRef = useRef<HTMLDialogElement>() as MutableRefObject<HTMLDialogElement>

  // this allows us to use the ref while also forwarding it
  // biome-ignore lint/correctness/useExhaustiveDependencies: refs added to deps have no effect (https://github.com/biomejs/biome/issues/1597)
  useImperativeHandle(ref, () => internalRef.current, [])

  // await is not necessary here, this should fire entirely in the background
  // eslint-disable-next-line @typescript-eslint/require-await
  const delayClose = useCallback(async (dialog: HTMLDialogElement) => {
    setTimeout(() => {
      dialog.classList.remove("mc-modal-closing")
      dialog.close()
      setIsClosing(false)
    }, 150)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: refs added to deps have no effect (https://github.com/biomejs/biome/issues/1597)
  useEffect(() => {
    const dialog = internalRef.current
    if (!(dialog instanceof HTMLDialogElement)) return
    const onMutate = (mutations: MutationRecord[]) => {
      if (mutations.find((m) => m.attributeName === "open")) {
        if (!dialog.open && !isClosing) {
          setIsClosing(true) // debounce
          dialog.showModal() // not quite yet
          dialog.classList.add("mc-modal-closing") // trigger animation
          // ignoring the promise is intended, this function must return ASAP
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

export const Modal = forwardRef<HTMLDialogElement, DialogProps>(
  ({ children, className, title, ...props }, ref) => {
    return (
      <AnimatedModal ref={ref} className={cn("mc-modal mc-base", className)} {...props}>
        <div className="mc-modal-container">
          <section className="mc-modal-content">
            <header>
              <h2>{title ?? "Modal Dialog"}</h2>
              <form method="dialog" aria-label="Cancel modal">
                <button type="submit">Cancel</button>
              </form>
            </header>
            {children}
          </section>
        </div>
      </AnimatedModal>
    )
  },
)
