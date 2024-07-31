import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Dropdown, DropdownItem, Modal, useError, useWallet, WalletConnect } from "@deepcomet/forge-react";
import { useAsyncCb } from "devhooks";
import { useEffect, useRef } from "react";
export const App = () => {
    const { isReady: isWalletReady, broadcast, addr } = useWallet();
    const { setError } = useError();
    const modalRef = useRef(null);
    const openModal = () => {
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };
    const [txRes, sendTx, clearTxRes] = useAsyncCb(async () => {
        if (!isWalletReady || !addr)
            throw new Error("Wallet is not connected");
        const message = {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
                fromAddress: addr,
                toAddress: "kujira18we0s6dcn4mhefdl9t8f7u6kctgex042mt2q6l",
                amount: [{ denom: "ukuji", amount: "100" }],
            },
        };
        return await broadcast([message], "Deepcomet Forge test transaction");
    }, [isWalletReady, addr, broadcast, setError], setError);
    useEffect(() => {
        if (txRes.loading || !(txRes.ok || txRes.err))
            return;
        console.log("Transaction result:", txRes.ok ?? txRes.err);
        clearTxRes();
    }, [txRes, clearTxRes]);
    return (_jsxs(_Fragment, { children: [_jsxs("main", { className: "vf-base", children: [_jsx("h1", { className: "title", children: "Deepcomet Forge React UI Demo" }), _jsxs("section", { className: "flex flex-col space-y-4", children: [_jsx("button", { type: "button", onClick: openModal, className: "vf-button-primary", children: "Open Modal" }), _jsxs(Dropdown, { align: "end", renderTrigger: (open) => (_jsx("button", { type: "button", onClick: open, className: "vf-button-secondary", children: "Open Dropdown" })), children: [_jsx(DropdownItem, { children: "Dropdown content A" }), _jsx(DropdownItem, { children: "Dropdown content B" }), _jsx(DropdownItem, { closeDropdown: true, children: "Close" })] }), _jsx(WalletConnect, { featuredTokens: ["KUJI", "USK", "WINK", "DEMO"], align: "end" }), _jsx("button", { type: "button", onClick: sendTx, className: "vf-button-secondary", children: "Test Transaction" })] })] }), _jsx(Modal, { ref: modalRef, children: _jsx("div", { className: "flex items-center justify-center h-80 w-full", children: _jsx("p", { className: "text-xl font-semibold text-neutral-800", children: "Modal content" }) }) })] }));
};
