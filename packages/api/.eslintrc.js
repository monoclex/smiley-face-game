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
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  overrides: [
    {
      files: ["*.js", "*.ts"],
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
  plugins: ["@typescript-eslint", "prettier", "import"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  rules: {
    "prettier/prettier": ["error"],
    "import/no-unresolved": "error",
    "no-undef": "error",
    // https://stackoverflow.com/a/64024916
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
  },
};

module.exports = config;
