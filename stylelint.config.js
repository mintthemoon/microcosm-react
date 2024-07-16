export default {
  extends: ["@culur/config-stylelint", "stylelint-config-recess-order"],
  plugins: ["stylelint-css-modules", "stylelint-plugin-defensive-css", "stylelint-use-nesting"],
  rules: {
    "plugin/use-defensive-css": [true, { severity: "warning" }],
    "at-rule-no-unknown": [true, { ignoreAtRules: ["theme"], severity: "warning" }],
    "csstools/use-nesting": "always",
    "css-modules/composed-class-names": true,
    "css-modules/css-variables": null,
    "import-notation": "string",
    "no-empty-source": [true, { severity: "warning" }],
    "custom-property-pattern": null,
  },
}
