const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const { DefinePlugin } = require("webpack");
const atlas = require("rust-atlas-generator-webpack-plugin");

module.exports = (env, argv) => {
  const mode = argv.mode;
  const bundle = argv.bundle;

  let plugins = [
    atlas({
      sourceDir: path.resolve(__dirname, "packages", "client", "src", "assets", "tiles"),
      targetDir: path.resolve(__dirname, "packages", "client", "src", "assets"),
      width: 32,
      height: 32,
    }),
    new DefinePlugin({
      "process.env.DEV": JSON.stringify(!!argv.dev),
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./packages/client/src/index.html",
      hash: true,
    }),
  ];

  if (bundle) plugins.push(new BundleAnalyzerPlugin());

  return {
    mode,
    entry: ["./packages/client/src/index.tsx"],
    resolve: {
      modules: [path.resolve(__dirname, "./packages"), path.resolve(__dirname, "./node_modules")],
      extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    module: {
      rules: [
        { test: /\.(j|t)sx?$/, use: { loader: "babel-loader", options: require("./babel.config.js") } },
        { test: /\.(png|mp3)$/, use: "file-loader" },
        { test: /\.svg$/, use: "@svgr/webpack" },
      ],
    },
    plugins,
    output: {
      filename: "[name].[hash].js",
      path: path.resolve(__dirname, "packages/client/dist"),
    },
    devServer: {
      historyApiFallback: true,
      port: 5000,
      hot: true,
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
      minimize: false, // mode === "production",
      minimizer: undefined, // mode === "production" ? [new TerserPlugin()] : undefined,
    },
  };
};
