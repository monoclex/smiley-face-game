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
    entry: "./index.ts",
    resolve: {
      extensions: [".js", ".ts"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: "@sucrase/webpack-loader",
            options: { transforms: ["typescript"] },
          },
          exclude: /node_modules/,
        },
      ],
    },
  };
}

module.exports = config;
