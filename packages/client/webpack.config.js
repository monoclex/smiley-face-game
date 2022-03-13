/*eslint-env node*/
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { DefinePlugin } = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const atlas = require("rust-atlas-generator-webpack-plugin");
const fs = require("fs");

/**
 * @param {{ serverMode: string }} env
 * @param {{ mode: "production" | "development"}} argv
 * @returns {import("webpack").Configuration}
 */
function config({ serverMode }, { mode }) {
  console.log("webpack running with", serverMode, mode);
  return {
    mode,
    devtool: mode === "development" ? "eval-source-map" : false,
    entry: "./src/index.tsx",
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: {
        "@material-ui/core/utils": "@mui/material/utils",
        "@material-ui/core/SvgIcon": "@mui/material/SvgIcon",
        "@": path.join(__dirname, "src"),
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
        { test: /\.css$/, use: "css-loader" },
      ],
    },
    plugins: [
      atlas({
        sourceDir: path.resolve(__dirname, "src", "assets", "tiles"),
        targetDir: path.resolve(__dirname, "src", "assets"),
        width: 32,
        height: 32,
        emitTiles: true,
      }),
      {
        /** @param {import("webpack").Compiler} compiler */
        apply(compiler) {
          compiler.hooks.beforeRun.tap("AfterAtlasPlugin", () => {
            const atlasJsonPath = path.resolve(__dirname, "src", "assets", "atlas_atlas.json");
            const atlasJson = JSON.parse(fs.readFileSync(atlasJsonPath, { encoding: "utf-8" }));
            fs.writeFileSync(
              path.resolve(__dirname, "src", "assets", "atlas.d.ts"),
              `declare const atlas: ${JSON.stringify(atlasJson)};\nexport default atlas;`
            );
          });
        },
      },
      new DefinePlugin({
        "import.meta.env.SERVER_MODE": JSON.stringify(serverMode),
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/index.html",
        hash: true,
      }),
    ],
  };
}

module.exports = config;
