/*eslint-env node*/
/** @type {import("eslint").Linter.Config} */
const config = {
  env: {
    browser: true,
    es2021: true,
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
  plugins: ["react", "@typescript-eslint", "prettier", "import"],
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx", ".svg", ".json", ".png", ".scss"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      webpack: {
        config: "webpack.config.js",
        env: {
          serverMode: "localhost",
        },
      },
    },
    react: {
      version: "17.0.2",
    },
  },
  rules: {
    "import/no-unresolved": "error",
    "prettier/prettier": ["error"],
    "react/no-unescaped-entities": "off",
    "react/prop-types": "off",
    "react/jsx-props-no-spreading": "off",
    "no-undef": "error",
    // https://stackoverflow.com/a/64024916
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "_.*" }],
    // this rule uses *70% of the time* in eslint
    "import/namespace": "off",
    "import/no-named-as-default-member": "off", // usually annoying and not helpful
  },
};

module.exports = config;
