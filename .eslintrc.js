module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "prettier",
    "prettier/react",
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
    "no-use-before-define": "error",
    "no-undef": "error",
    // https://stackoverflow.com/a/64024916
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "packages/*/tsconfig.json",
      },
    },
  },
};
