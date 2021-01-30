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
import builtins from "rollup-plugin-node-builtins";

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
    alias({
      customResolver,
      entries: [
        {
          // TODO: submit a PR to get it to work properly with package.json stuff
          find: /mini-signals/,
          replacement: path.join(nodeModules, "mini-signals", "src"),
        },
        {
          find: /@smiley-face-game\/api\/(.*)/,
          replacement: `${apiSrcRootDir}/$1`,
        },
        // {
        //   // workaround because otherwise it reads from '@material-ui/core/node/' and
        //   // doesn't understand its highly dynamic export syntax
        //   find: /@material-ui\/core(.*)/,
        //   replacement: `${path.join(nodeModules, "@material-ui", "core", "$1")}`,
        // },
        // {
        //   // without this, @material-ui/core can't find this (for whatever reason)
        //   find: /@material-ui\/system(.*)/,
        //   replacement: `${path.join(nodeModules, "@material-ui", "system", "$1")}`,
        // },
        // {
        //   // without this, @material-ui/system can't find this (for whatever reason)
        //   find: /@material-ui\/utils(.*)/,
        //   replacement: `${path.join(nodeModules, "@material-ui", "utils", "$1")}`,
        // },
        // {
        //   // without this, @material-ui/core can't find this (for whatever reason)
        //   find: /@material-ui\/unstyled(.*)/,
        //   replacement: `${path.join(nodeModules, "@material-ui", "unstyled", "modern", "$1")}`,
        // },
        {
          find: /@material-ui\/icons(.*)/,
          replacement: path.join(nodeModules, "@material-ui", "icons", "esm", "$1"),
        },
        {
          find: /@material-ui\/lab(.*)/,
          replacement: path.join(nodeModules, "@material-ui", "lab", "esm", "$1"),
        },
      ],
    }),
    // pixi.js imports from "url" for some reason
    builtins(),
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
    commonjs({
      // it's of my moral opinion to be a righteous steward of my code, and to manually
      // only write the modules that are commonjs here. it's a hitlist of PRs i may one day send
      // (this also has benefits like decreasing bundle time & bundle size)
      include: [
        /\/react\//,
        /\/react-is\//,
        /\/scheduler\//,
        /\/mdi-material-ui\//,
        /\/prop-types\//,
        /\/path-to-regexp\//,
        /\/hoist-non-react-statics\//,
        /\/react-dom\//,
        /\/computed-types\//,
        /\/es6-promise-polyfill\//,
        /\/object-assign\//,
        /\/eventemitter3\//,
        /\/parse-uri\//,
        /\/earcut\//,
        /\/cross-fetch\//,
        /\/isomorphic-ws\//,
        /\/fast-deep-equal\//,
        /\/rebound\//,
        /\/react-custom-scrollbars\//,
        /\/react-sizeme\//,
        /\/react-joystick-component\//,
        // after this point, are the "manual dependencies" - the real tough ones
        // you don't get any blatant compile time errors, these are the runtime error ones you have to find
        // enabling sourcemap helps
        /\/react-router\//,
        /\/@babel\/runtime\/helpers\//,
      ],
    }),
    url({ include: ["**/*.png", "**/*.json"] }),
    svgr(),
    sucrase({
      include: ["./src/**", "../api/src/**"],
      exclude: ["node_modules/**"],
      transforms: ["typescript", "jsx"],
      production: true,
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
