import { jsx as _jsx } from "react/jsx-runtime";
import { MicrocosmProvider } from "@microcosm/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./main.css";
const root = document.getElementById("root");
if (!root)
    throw new Error("Could not find root element");
ReactDOM.createRoot(root).render(_jsx(React.StrictMode, { children: _jsx(MicrocosmProvider, { rpcUrl: "https://kujira-testnet-rpc.polkachu.com", chainId: "harpoon-4", children: _jsx(App, {}) }) }));
