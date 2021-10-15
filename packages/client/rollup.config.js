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
import rustAtlasGenerator from "rollup-plugin-rust-atlas-generator";
import json from "@rollup/plugin-json";

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
    rustAtlasGenerator({
      sourceDir: path.resolve(__dirname, "./src/assets/tiles"),
      targetDir: path.resolve(__dirname, "./src/assets"),
      width: 32,
      height: 32,
    }),
    json(),
    // pixi.js imports from "url" for some reason, so we have to include node builtins
    builtins(),
    replace({
      preventAssignment: false,
      "import.meta.env.NODE_ENV": JSON.stringify("production"),
      "process.env.NODE_ENV": JSON.stringify("production"),
      "import.meta.env.DEV": false,
    }),
    replace({
      // process-es6 dependency is weird
      "global.performance": JSON.stringify("globalThis.performance"),
    }),
    alias({
      customResolver,
      entries: [
        // TODO: submit a PR to get mini-signals to work properly with package.json stuff
        { find: /mini-signals/, replacement: nodeModule("mini-signals/src") },
        { find: /@smiley-face-game\/api\/(.+)/, replacement: `${apiSrcRootDir}/$1` },
        { find: /@smiley-face-game\/api\/?/, replacement: `${apiSrcRootDir}/index.ts` },
        { find: /@material-ui\/icons(.*)/, replacement: nodeModule("@mui/icons-material/esm/$1") },
        { find: /@material-ui\/lab(.*)/, replacement: nodeModule("@mui/lab/esm/$1") },
      ],
    }),
    resolve({
      mainFields: ["module", "browser"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
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
        /\/isarray\//,
        /\/react-dom\//,
        /\/scheduler\//,
        /\/raf\//,
        /\/performance-now\//,
        /\/dom-css\//,
        /\/prefix-style\//,
        /\/to-camel-case\//,
        /\/to-space-case\//,
        /\/to-no-case\//,
        /\/add-px-to-style\//,
        /\/invariant\//,
        /\/element-resize-detector\//,
        /\/shallowequal\//,
        /\/batch-processor\//,
      ],
    }),
    url({ include: ["**/*.png"] }),
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
