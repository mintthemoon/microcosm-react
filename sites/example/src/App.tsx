import { Dropdown, DropdownItem, Modal, useError, useWallet, Wallet } from "@microcosm/react"
import "./App.css"
import { useCallback, useRef } from "react"

export const App = () => {
  const { isReady, broadcast, addr } = useWallet()
  const { setError } = useError()
  const modalRef = useRef<HTMLDialogElement | null>(null)

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.showModal()
    }
  }

  const sendTestTx = useCallback(async () => {
    try {
      if (!isReady || !addr) throw new Error("Wallet is not connected")
      const message = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: addr,
          toAddress: "kujira18we0s6dcn4mhefdl9t8f7u6kctgex042mt2q6l",
          amount: [{ denom: "ukuji", amount: "100" }],
        },
      }
      const res = await broadcast([message], "Microcosm test tx")
      console.log("Test tx result", res)
    } catch (err) {
      setError(err as Error)
    }
  }, [isReady, addr, broadcast, setError])

  return (
    <>
      <main className="mc-base">
        <h1 className="title">Microcosm React Framework Demo</h1>
        <section className="flex flex-col space-y-4">
          <button type="button" onClick={openModal} className="mc-button-primary">Open Modal</button>
          <Dropdown
            align="end"
            triggerRender={(open: () => void) => (
              <button type="button" onClick={open} className="mc-button-secondary">Open Dropdown</button>
            )}
          >
            <DropdownItem>Dropdown content A</DropdownItem>
            <DropdownItem>Dropdown content B</DropdownItem>
            <DropdownItem closeDropdown>Close</DropdownItem>
          </Dropdown>
          <Wallet featuredTokens={["KUJI", "USK", "WINK"]} align="end" />
          <button type="button" onClick={sendTestTx} className="mc-button-secondary">Test Transaction</button>
        </section>
      </main>
      <Modal ref={modalRef}>
        <div className="flex items-center justify-center h-80 w-full">
          <p className="text-xl font-semibold text-neutral-800">Modal content</p>
        </div>
      </Modal>
    </>
  )
}
