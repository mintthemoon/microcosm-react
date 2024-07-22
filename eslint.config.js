import eslint from "@eslint/js"
import tseslintPlugin from "@typescript-eslint/eslint-plugin"
import tseslintParser from "@typescript-eslint/parser"
// TODO reenable: import compat from "eslint-plugin-compat"
// need to figure out why it seems to not be respecting my browserslist in package.json
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import globals from "globals"

export default tseslint.config(
  { ignores: ["**/dist/", "**/node_modules/"] },
  eslint.configs.recommended,
  // compat.configs["flat/recommended"],
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tseslintParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: {
          // TODO figure out what the hell this means. I've argued with eslint enough today and this seems like an absurd limitation
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      "react-refresh": reactRefresh,
      "react-hooks": reactHooks,
    },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],
    },
    settings: { react: { version: "detect" } },
  },
  { files: ["**/*.{js,jsx}"], extends: [tseslint.configs.disableTypeChecked] },
  { files: ["**/__bin__/**/*.{js,jsx}"], languageOptions: { globals: { ...globals.nodeBuiltin } } },
)
