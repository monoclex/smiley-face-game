/* eslint-disable @typescript-eslint/no-var-requires */

const esbuild = require("esbuild");
const ignorePlugin = require("esbuild-plugin-ignore");

function build() {
  return esbuild.build({
    bundle: true,
    outdir: "./dist/",
    platform: "neutral",
    plugins: [
      ignorePlugin([
        { resourceRegExp: /cross-fetch/, contextRegExp: /.?/ },
        { resourceRegExp: /isomorphic-ws/, contextRegExp: /.?/ },
      ]),
    ],
    entryPoints: ["./src/index.ts", "./src/generateBlankWorld.entrypoint.ts"],
    logLevel: "error",
    treeShaking: true,
  });
}

module.exports = build;

if (require.main === module) {
  build()
    .then(({ errors }) => errors && console.log("errors:", errors))
    .catch(console.error);
}
