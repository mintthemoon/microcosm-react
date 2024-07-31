import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { resolve } from "node:path"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [tsconfigPaths(), react(), tailwindcss()],
  build: { cssMinify: "lightningcss" },
  css: { transformer: "lightningcss" },
  config: command === "serve" ?
    { alias: { "@deepcomet/forge-react": resolve(__dirname, "..", "..", "packages", "react", "lib") } } :
    {},
}))
