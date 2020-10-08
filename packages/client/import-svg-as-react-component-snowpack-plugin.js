const svgr = require("@svgr/core").default;
const fs = require("fs/promises");
const { transformAsync } = require("@babel/core");

/** @type {import("snowpack").SnowpackPluginFactory} */
module.exports = function () {
  return {
    name: "import-svg-as-react-component-snowpack-plugin",
    resolve: { input: [".svg"], output: [".js"] },
    load: async ({ filePath }) => {
      const svgContents = await fs.readFile(filePath, "utf-8");
      const thruSvgr = await svgr(svgContents);
      const transformedJsx = await transformAsync(`/** @jsxRuntime classic */\n${thruSvgr}`, {
        plugins: [require("@babel/plugin-syntax-jsx"), require("@babel/plugin-transform-react-jsx")],
      });
      return transformedJsx.code; // await svgr(await fs.readFile(filePath, "utf-8")),
    },
  };
};
