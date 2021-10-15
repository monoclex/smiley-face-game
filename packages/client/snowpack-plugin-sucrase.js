// https://github.com/snowpackjs/create-snowpack-app/issues/122

const { transform: sucrase } = require("sucrase");
const fs = require("fs/promises");
const path = require("path");

/** @type {import("snowpack").SnowpackPluginFactory<import("sucrase").Options>} */
module.exports = function sucrasePlugin(config, options = {}) {
  if (!options.transforms) options.transforms = ["typescript"];

  const extensions = [".js", ".jsx", ".ts", ".tsx"];

  return {
    name: "snowpack-plugin-sucrase",
    resolve: {
      input: extensions,
      output: [".js"],
    },
    async load({ filePath, fileExt, isDev, isSSR, isHmrEnabled }) {
      if (extensions.indexOf(fileExt) === -1) return;

      const transformed = sucrase(
        await fs.readFile(filePath, "utf-8"),
        Object.assign({}, options, {
          filePath,
          sourceMapOptions: {
            compiledFilename: filePath,
          },
        })
      );

      return {
        [".js"]: {
          code: transformed.code,
          map: JSON.stringify(transformed.sourceMap),
        },
      };
    },
    async transform({ id, fileExt, contents, isDev, isHmrEnabled }) {
      if (extensions.indexOf(fileExt) === -1) return;

      const transformed = sucrase(
        contents,
        Object.assign({}, options, {
          filePath: id,
          sourceMapOptions: {
            compiledFilename: id,
          },
        })
      );

      return {
        contents: transformed.code,
        map: transformed.sourceMap,
      };
    },
  };
};
