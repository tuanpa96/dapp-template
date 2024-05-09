module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "prettier", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
    ],
    "react/jsx-uses-react": "warn",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-var-requires": "warn",
    "react/no-children-prop": "warn",
    "react/jsx-key": "warn",
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "no-unsafe-optional-chaining": "warn",
    "react/prop-types": "warn",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-empty-function": "warn",
    "no-fallthrough": "warn",
  },
};
