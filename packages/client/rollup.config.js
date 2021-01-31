import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
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

const nodeModule = (nodeModule) => path.resolve(__dirname, "..", "..", "node_modules", nodeModule);

/** @type {import("rollup").RollupOptions} */
const config = {
  // https://rollupjs.org/guide/en/#preserveentrysignatures
  preserveEntrySignatures: false,
  input: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    dir: path.resolve(__dirname, "dist"),
    format: "esm",
  },
  plugins: [
    alias({
      customResolver,
      entries: [
        // TODO: submit a PR to get mini-signals to work properly with package.json stuff
        { find: /mini-signals/, replacement: nodeModule("mini-signals/src") },
        { find: /@smiley-face-game\/api\/(.*)/, replacement: `${apiSrcRootDir}/$1` },
        { find: /@material-ui\/icons(.*)/, replacement: nodeModule("@material-ui/icons/esm/$1") },
        { find: /@material-ui\/lab(.*)/, replacement: nodeModule("@material-ui/lab/esm/$1") },
      ],
    }),
    // pixi.js imports from "url" for some reason, so we have to include node builtins
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
