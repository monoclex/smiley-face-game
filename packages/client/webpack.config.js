const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const path = require("path");
const fs = require("fs");

module.exports = {
  mode: "production",
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
        use: {
          loader: "babel-loader",
        }
      },
      {
        test: /\.(png|svg)$/,
        use: {
          loader: "url-loader"
        }
      }
      // { test: /\.$/, use: "raw-loader" }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      hash: true
    })
  ],
  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    historyApiFallback: true,
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    },
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
};
