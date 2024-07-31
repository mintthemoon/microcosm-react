import { Dropdown, DropdownItem, Modal, useError, useWallet, WalletConnect } from "@deepcomet/forge-react"
import { useAsyncCb } from "devhooks"
import { useEffect, useRef } from "react"

export const App = () => {
  const { isReady: isWalletReady, broadcast, addr } = useWallet()
  const { setError } = useError()
  const modalRef = useRef<HTMLDialogElement | null>(null)

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.showModal()
    }
  }

  const [txRes, sendTx, clearTxRes] = useAsyncCb(
    async () => {
      if (!isWalletReady || !addr) throw new Error("Wallet is not connected")
      const message = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
          fromAddress: addr,
          toAddress: "kujira18we0s6dcn4mhefdl9t8f7u6kctgex042mt2q6l",
          amount: [{ denom: "ukuji", amount: "100" }],
        },
      }
      return await broadcast([message], "Deepcomet Forge test transaction")
    },
    [isWalletReady, addr, broadcast, setError],
    setError,
  )

  useEffect(() => {
    if (txRes.loading || !(txRes.ok || txRes.err)) return
    console.log("Transaction result:", txRes.ok ?? txRes.err)
    clearTxRes()
  }, [txRes, clearTxRes])

  return (
    <>
      <main className="vf-base">
        <h1 className="title">Deepcomet Forge React UI Demo</h1>
        <section className="flex flex-col space-y-4">
          <button type="button" onClick={openModal} className="vf-button-primary">Open Modal</button>
          <Dropdown
            align="end"
            renderTrigger={(open: () => void) => (
              <button type="button" onClick={open} className="vf-button-secondary">Open Dropdown</button>
            )}
          >
            <DropdownItem>Dropdown content A</DropdownItem>
            <DropdownItem>Dropdown content B</DropdownItem>
            <DropdownItem closeDropdown>Close</DropdownItem>
          </Dropdown>
          <WalletConnect featuredTokens={["KUJI", "USK", "WINK", "DEMO"]} align="end" />
          <button type="button" onClick={sendTx} className="vf-button-secondary">Test Transaction</button>
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
