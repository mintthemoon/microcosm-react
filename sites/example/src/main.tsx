import { DeepcometForge } from "@deepcomet/forge-react"
import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import "./main.css"

const root = document.getElementById("root")
if (!root) throw new Error("Could not find root element")
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <DeepcometForge rpcUrl="https://rpc-kujira.mintthemoon.xyz" chainId="kaiyo-1">
      <App />
    </DeepcometForge>
  </React.StrictMode>,
)
