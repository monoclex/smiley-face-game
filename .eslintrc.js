module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["plugin:react/recommended", "prettier", "prettier/react"],
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  settings: {
    react: {
      version: "16.13",
    },
  },
  rules: {
    "prettier/prettier": ["error"],
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/jsx-props-no-spreading": "off",
  },
};