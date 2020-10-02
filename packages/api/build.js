const swc = require("@swc/core");
const { promises: fs } = require("fs");
const path = require("path");
const plugin = require("./swc-rewrite-plugin");

main()
  .then(() => console.log("done"))
  .catch(console.error);

async function main() {
  const swcrc = JSON.parse(await fs.readFile("./.swcrc", "utf-8"));

  /** @type {[string, Promise<void>][]} */
  let transforms = [];
  for await (const file of walk("./src/")) {
    // TODO: building files in parallel seems to have the adverse effect of generating incorrect code
    // thankfully, doing this in serial is way faster than tsc
    await swcTransform(file, swcrc);
    // transforms.push([file, ])
  }

  // await Promise.all(transforms.map(([_, promise]) => promise.catch(console.error)));
}

async function swcTransform(filename, swcrc) {
  const source = await fs.readFile(filename, "utf-8");
  const transformed = await swc.transform(source, {
    filename,
    sourceFileName: filename,
    plugin,
    swcrc: false,
    ...swcrc,
  });

  if (filename.endsWith(".ts") || filename.endsWith(".js")) {
    filename = filename.substr(0, filename.length - ".xs".length);
    filename += ".js";
  }

  const target = path.join("dist/", filename.substr("src/".length));
  const dir = path.dirname(target);
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.truncate(target, 0);
  } catch {}
  await fs.writeFile(target, transformed.code);
}

async function* walk(dir) {
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}
