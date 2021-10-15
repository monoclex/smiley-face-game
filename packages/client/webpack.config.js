/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { DefinePlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const atlas = require("rust-atlas-generator-webpack-plugin");

const isProd = (mode) => mode === "production";
const isDev = (mode) => mode === "development";

/**
 * @param {unknown} mode
 * @returns {"production" | "development"}
 */
function parseMode(mode) {
  if (isProd(mode)) return "production";
  else if (isDev(mode)) return "development";
  else throw new Error(`mode '${mode}' not "production" | "development"`);
}

/**
 * @typedef {{[index: string]: string | boolean | Env}} Env
 */

/**
 * @param {Env} env
 * @returns {import("webpack").Configuration}
 */
function config(env) {
  const mode = parseMode(env.mode);

  return {
    mode,
    devtool: isProd(mode) ? false : "eval-source-map",
    entry: "./src/index.tsx",
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        "@material-ui/core/utils": "@mui/material/utils",
        "@material-ui/core/SvgIcon": "@mui/material/SvgIcon",
      },
    },
    devServer: {
      historyApiFallback: true,
      port: 5000,
      hot: true,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|jsx)$/,
          use: {
            loader: "@sucrase/webpack-loader",
            options: { transforms: ["typescript", "jsx"] },
          },
          exclude: /node_modules/,
        },
        { test: /\.(png|mp3)$/, use: "file-loader" },
        { test: /\.svg$/, use: "@svgr/webpack" },
      ],
    },
    plugins: [
      atlas({
        sourceDir: path.resolve(__dirname, "src", "assets", "tiles"),
        targetDir: path.resolve(__dirname, "src", "assets"),
        width: 32,
        height: 32,
      }),
      new DefinePlugin({
        "import.meta.env.DEV": JSON.stringify(isDev(mode)),
        "import.meta.env.NODE_ENV": JSON.stringify(mode),
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        hash: true,
      }),
    ],
    optimization: {
      minimize: isProd(mode),
    },
  };
}

module.exports = config;
