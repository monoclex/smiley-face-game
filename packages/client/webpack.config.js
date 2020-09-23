const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require("path");
const fs = require("fs");

module.exports = (env, argv) => {
  const mode = argv.mode;
  const bundle = argv.bundle

  return {
    mode,
    entry: ["./src/index.jsx"],
    resolve: {
      modules: [path.resolve("./src"), path.resolve(__dirname, "../../node_modules")],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          // TODO: figure this out?
          // exclude: /node_modules/,
          use: "babel-loader"
        },
        {
          test: /\.(png|mp3)$/,
          use: "file-loader",
        },
        {
          test: /\.svg$/,
          use: "@svgr/webpack"
        }
        // { test: /\.$/, use: "raw-loader" }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "src/index.html",
        hash: true
      }),
      bundle && new BundleAnalyzerPlugin(),
    ],
    output: {
      filename: "[name].[contenthash].js",
      path: path.resolve(__dirname, "dist"),
    },
    devServer: {
      historyApiFallback: true,
      port: 5000
    },
    optimization: {
      splitChunks: {
        chunks: "all"
      },
      minimize: mode === "production",
      minimizer: mode === "production"? [new TerserPlugin()] : undefined,
    }
  };
}