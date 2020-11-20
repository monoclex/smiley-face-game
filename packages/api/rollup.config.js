import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

/** @type {import("rollup").RollupOptions} */
const config = {
  input: "src/index.ts",
  output: {
    file: "pkg/dist.umd.min.js",
    format: "umd",
    name: "sfg",
  },
  plugins: [nodeResolve({ mainFields: ["browser"] }), commonjs(), typescript(), terser()],
};

export default config;
