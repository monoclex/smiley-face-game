import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "lib.umd.min.js",
      format: "umd",
      name: "sfg",
    },
    plugins: [
      nodeResolve({
        mainFields: ["browser"],
      }),
      commonjs(),
      typescript(),
      terser(),
    ],
  },
];
