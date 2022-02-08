const esbuild = require("esbuild");
const { esbuildDecorators } = require("@anatine/esbuild-decorators");

esbuild
  .build({
    bundle: true,
    outfile: "dist/app.cjs",
    platform: "node",
    external: ["nock", "aws-sdk", "mock-aws-s3"],
    plugins: [esbuildDecorators({})],
    entryPoints: ["./src/index.ts"],
    keepNames: true,
  })
  .then(({ errors }) => console.log("errors", errors))
  .catch(console.error);
