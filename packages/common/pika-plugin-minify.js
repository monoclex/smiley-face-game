/**
 * @description `pika-plugin-minify` has a bug, and this fixes that bug by ignoring if it can't find `index.js`.
 */

const path = require("path");
const { readdirSync, lstat, exists, readFileSync, writeFile } = require("fs");
const { minify } = require("terser");

const minifyOptions = {
  sourceMap: {
    filename: "index.min.js",
    url: "index.min.js.map",
  },
};

exports.build = async function build({ cwd, out, options, reporter }) {
  const terserOptions = { ...minifyOptions, ...(options.terserOptions || {}) };
  await Promise.all(
    readdirSync(out).map(
      (dir) =>
        new Promise((resolve) => {
          lstat(path.join(out, dir), (err, stats) => {
            if (err) throw err;
            if (stats.isDirectory()) {
              const indexPath = path.join(path.join(out, dir, "index.js"));
              // bug fix start
              lstat(indexPath, (err, stats) => {
                if (err) {
                  resolve();
                  return;
                } // don't throw err
                if (!stats.isFile()) {
                  resolve();
                  return;
                }
                // bug fix end
                const code = readFileSync(indexPath, "utf-8");
                exists(indexPath, async (exists) => {
                  if (exists) {
                    var result = await minify(code, terserOptions);
                    if (result.error) throw result.error;
                    await Promise.all([
                      new Promise((resolve) => writeFile(path.join(out, dir, terserOptions.sourceMap.filename), result.code, resolve)),
                      new Promise((resolve) => writeFile(path.join(out, dir, terserOptions.sourceMap.url), result.map, resolve)),
                    ]);
                    resolve();
                  } else {
                    resolve();
                  }
                });
                // bug fix start
              });
              // bug fix end
            } else {
              resolve();
            }
          });
        })
    )
  );
};
