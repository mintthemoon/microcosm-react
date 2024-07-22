export default {
  extends: ["stylelint-config-recess-order"],
  plugins: [
    "stylelint-css-modules",
    "stylelint-plugin-logical-css",
    "stylelint-plugin-defensive-css",
    "stylelint-use-nesting",
  ],
  rules: {
    "plugin/use-defensive-css": [true, {
      severity: "warning",
      backgroundRepeat: true,
      flexWrapping: true,
      vendorPrefixGrouping: true,
    }],
    "plugin/use-logical-units": [true, { severity: "warning", disableAutoFix: true }],
    "plugin/use-logical-properties-and-values": [true, {
      severity: "warning",
      disableAutoFix: true,
      ignore: ["overflow-y", "overflow-x"],
    }],
    "at-rule-no-unknown": [true, { ignoreAtRules: ["theme", "apply"], severity: "warning" }],
    "csstools/use-nesting": "always",
    "css-modules/composed-class-names": true,
    "css-modules/css-variables": null,
    "import-notation": "string",
    "no-empty-source": [true, { severity: "warning" }],
    "custom-property-pattern": null,
  },
}
