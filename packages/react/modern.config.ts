import { defineConfig, moduleTools } from "@modern-js/module-tools"

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: "npm-components-es2020",
  buildConfig: { input: ["lib/index.ts", "lib/utility/index.ts"] },
})
