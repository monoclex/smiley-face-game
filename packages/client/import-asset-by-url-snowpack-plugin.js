const fs = require("fs/promises");

/**
 * @description Joins two path looking like strings together by properly stitching both ends where the slashes are.
 * @type {(a: string, b: string) => string}
 */
function joinPaths(a, b) {
  // normalize to / so that nothing is wonky for URL imports (because that's what we're joining a path for)
  a = a.replace(/\\/g, "/");
  b = b.replace(/\\/g, "/");

  // remove slashes from the ends of the paths
  while (a.endsWith("/")) {
    a = a.substr(0, a.length - 1);
  }

  while (b.startsWith("/")) {
    b = b.substr(1);
  }

  // join them together with a slash
  return `${a}/${b}`;
}

/** @type {(mount: Record<string, string>, filePath: string) => [mountPath: string, subPath: string]} */
function findAssetPath(mount, filePath) {
  for (const mountPath in mount) {
    if (filePath.startsWith(mountPath)) {
      return [mount[mountPath], filePath.substring(mountPath.length)];
    }
  }

  throw new Error(`Couldn't find mounted path for asset '${filePath}'`);
}

/** @type {import("snowpack").SnowpackPluginFactory<ImportAssetByUrlSnowpackPluginOptions>} */
module.exports = function ({ mount }, { extensions }) {
  return {
    name: "import-asset-by-url-snowpack-plugin",
    resolve: { input: extensions, output: [...extensions, ".js"] },
    load: async ({ filePath, fileExt }) => {
      const [assetMountPath, assetSubPath] = findAssetPath(mount, filePath);
      const assetUrl = joinPaths(assetMountPath, assetSubPath);

      return {
        [".js"]: {
          code: `export default ${JSON.stringify(assetUrl)};`,
        },
        [fileExt]: {
          code: await fs.readFile(filePath),
        },
      };
    },
  };
};
