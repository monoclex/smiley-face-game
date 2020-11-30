const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const { DefinePlugin } = require("webpack");
const atlas = require("rust-atlas-generator-webpack-plugin");

module.exports = (env, argv) => {
  const mode = env.mode;

  let plugins = [
    atlas({
      sourceDir: path.resolve(__dirname, "packages", "client", "src", "assets", "tiles"),
      targetDir: path.resolve(__dirname, "packages", "client", "src", "assets"),
      width: 32,
      height: 32,
    }),
    new DefinePlugin({
      "process.env.DEV": JSON.stringify(!!env.dev),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./packages/client/src/index.html",
      hash: true,
    }),
  ];

  return {
    mode,
    entry: ["./packages/client/src/index.tsx"],
    resolve: {
      modules: [path.resolve(__dirname, "./packages"), path.resolve(__dirname, "./node_modules")],
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          include: path.resolve(__dirname, "./packages"),
          use: { loader: "babel-loader", options: require("./babel.config.js") },
        },
        { test: /\.(png|mp3)$/, use: "file-loader" },
        { test: /\.svg$/, use: "@svgr/webpack" },
      ],
    },
    plugins,
    output: {
      path: path.resolve(__dirname, "packages/client/dist"),
    },
    devServer: {
      historyApiFallback: true,
      port: 5000,
      hot: true,
    },
    optimization: {
      minimize: mode === "production",
    },
  };
};
