const fs = require("fs/promises");

const esbuild = require("esbuild");
const { esbuildDecorators } = require("@anatine/esbuild-decorators");
const { default: ImportGlobPlugin } = require("esbuild-plugin-import-glob");

function build() {
  return esbuild
    .build({
      bundle: true,
      outfile: "dist/app.cjs",
      platform: "node",
      external: ["nock", "aws-sdk", "mock-aws-s3", "pg-native"],
      plugins: [esbuildDecorators({}), ImportGlobPlugin()],
      entryPoints: ["./src/index.ts"],
      keepNames: true,
      logLevel: "error",
    })
    .then(() => fs.copyFile("connection.json", "dist/connection.json"));
}

module.exports = build;

if (require.main === module) {
  build()
    .then(({ errors }) => console.log("errors:", errors))
    .catch(console.error);
}
