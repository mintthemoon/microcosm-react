import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc"
import { join, resolve } from "node:path"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import lightningcss from "vite-plugin-lightningcss"
import noBundle from "vite-plugin-no-bundle"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import tsconfigPaths from "vite-plugin-tsconfig-paths"

export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    dts({ copyDtsFiles: true }),
    lightningcss({ minify: true }),
    tailwindcss(),
    tsconfigPaths(),
    nodePolyfills(),
    visualizer({
      gzipSize: true,
      brotliSize: true,
      filename: join("dist", ".stats.html"), /* template: "network" */
    }),
  ],
  build: {
    css: { transformer: "lightningcss" },
    cssMinify: "lightningcss",
    emptyOutDir: false,
    lib: { entry: resolve(__dirname, "lib/index.ts"), fileName: "index", formats: ["es"] },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: { globals: { react: "React", "react-dom": "ReactDOM" } },
    },
    sourcemap: true,
    plugins: [noBundle({ copy: ["**/*.css"] })],
  },
}))
