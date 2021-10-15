/** @type {import("eslint").Linter.Config} */
const config = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
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
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  settings: {
    react: {
      version: "17.0.2",
    },
  },
  rules: {
    "prettier/prettier": ["error"],
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/jsx-props-no-spreading": "off",
    "no-undef": "error",
    // https://stackoverflow.com/a/64024916
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
  },
};

module.exports = config;
