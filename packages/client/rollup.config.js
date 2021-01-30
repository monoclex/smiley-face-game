import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
// import { babel } from "@rollup/plugin-babel";
import svgr from "@svgr/rollup";
import url from "@rollup/plugin-url";
import sucrase from "@rollup/plugin-sucrase";
import alias from "@rollup/plugin-alias";
import path from "path";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";

const customResolver = resolve({
  extensions: [".js", ".jsx", ".ts", ".tsx"],
});
const apiSrcRootDir = path.resolve(__dirname, "..", "api", "src");

const nodeModules = path.resolve(__dirname, "..", "..", "node_modules");
const nodeModule = (module) => path.resolve(nodeModules, module);

/** @type {import("rollup").RollupOptions} */
const config = {
  // https://rollupjs.org/guide/en/#preserveentrysignatures
  preserveEntrySignatures: "strict",
  input: path.resolve(__dirname, "src", "index.tsx"),
  // input: path.resolve(__dirname, "source.ts"),
  output: {
    dir: path.resolve(__dirname, "dist"),
    // file: path.resolve(__dirname, "dist", "bundle.js"),
    format: "esm",
  },
  plugins: [
    replace({
      "import.meta.env.NODE_ENV": JSON.stringify("production"),
      "process.env.NODE_ENV": JSON.stringify("production"),
      "import.meta.env.DEV": false,
    }),
    resolve({
      mainFields: ["module"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      browser: true,
    }),
    commonjs({}),
    url({ include: ["**/*.png", "**/*.json"] }),
    svgr(),
    sucrase({
      include: ["./src/**", "../api/src/**"],
      exclude: ["node_modules/**"],
      transforms: ["typescript", "jsx"],
      production: true,
    }),
    alias({
      customResolver,
      entries: [
        {
          find: /@smiley-face-game\/api\/(.*)/,
          replacement: `${apiSrcRootDir}/$1`,
        },
        {
          // workaround because otherwise it reads from '@material-ui/core/node/' and
          // doesn't understand its highly dynamic export syntax
          find: /@material-ui\/core(.*)/,
          replacement: `${path.join(nodeModules, "@material-ui", "core", "$1")}`,
        },
        {
          // without this, @material-ui/core can't find this (for whatever reason)
          find: /@material-ui\/system(.*)/,
          replacement: `${path.join(nodeModules, "@material-ui", "system", "$1")}`,
        },
        {
          // without this, @material-ui/system can't find this (for whatever reason)
          find: /@material-ui\/utils(.*)/,
          replacement: `${path.join(nodeModules, "@material-ui", "utils", "$1")}`,
        },
        {
          // without this, @material-ui/core can't find this (for whatever reason)
          find: /@material-ui\/unstyled(.*)/,
          replacement: `${path.join(nodeModules, "@material-ui", "unstyled", "modern", "$1")}`,
        },
      ],
    }),
    terser(),
    copy({
      targets: [
        {
          src: "./src/index.html",
          dest: "./dist/",
        },
      ],
    }),
  ],
};

export default config;
