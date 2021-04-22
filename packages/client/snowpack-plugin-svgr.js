const { transform } = require("sucrase");
const svgr = require("@svgr/core").default;
const fs = require("fs/promises");

/**
 * Uses svgr to transform SVGs into JSX components, and then uses Sucrase to transform JSX into JS.
 * @type {import("snowpack").SnowpackPluginFactory}
 */
module.exports = function () {
  return {
    name: "snowpack-plugin-svgr",
    resolve: { input: [".svg"], output: [".js"] },
    load: async ({ filePath }) => {
      const svgContents = await fs.readFile(filePath, "utf-8");
      const thruSvgr = await svgr(svgContents);
      const transformedJsx = transform(thruSvgr, {
        filePath,
        transforms: ["jsx"],
        sourceMapOptions: {
          compiledFilename: filePath,
        },
      });

      return {
        [".js"]: {
          code: transformedJsx.code,
          map: JSON.stringify(transformedJsx.sourceMap),
        },
      };
    },
  };
};
