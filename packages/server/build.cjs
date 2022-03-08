const esbuild = require("esbuild");
const ignorePlugin = require("esbuild-plugin-ignore");

function build() {
  return esbuild.build({
    bundle: true,
    outfile: "dist/app.cjs",
    platform: "neutral",
    plugins: [
      ignorePlugin([
        { resourceRegExp: /cross-fetch/, contextRegExp: /.?/ },
        { resourceRegExp: /isomorphic-ws/, contextRegExp: /.?/ },
      ]),
    ],
    entryPoints: ["./src/index.ts"],
    keepNames: true,
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
