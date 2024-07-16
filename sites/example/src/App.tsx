import { Dialog } from "@microcosm/react"
import "./App.css"
import { useRef } from "react"

export const App = () => {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
  }

  return (
    <>
      <main className="mc-component">
        <h1 className="title">Microcosm React Framework Demo</h1>
        <button type="button" onClick={openDialog} className="mc-button-primary">Open Dialog</button>
      </main>
      <Dialog ref={dialogRef}>
        <div className="flex items-center justify-center h-80 w-full">
          <p className="text-xl font-semibold text-neutral-800">Dialog content</p>
        </div>
      </Dialog>
    </>
  )
}
