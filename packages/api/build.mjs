/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * This script builds the Smiley Face Game API into a `dist` folder.
 * Upon running this script, it is expected that you run `npm publish` in the `dist` folder.
 */

import process from "process";
import child_process from "child_process";
import json from "./package.json";
import fs from "fs/promises";
import path from "path";

await fs.rm("dist", { recursive: true }).catch(() => undefined);
await fs.mkdir("dist");

await Promise.all([
  // Copy a modified/cleaned `package.json`
  packageJson(),
  // Copy the `README`
  fs.copyFile("./README.md", "./dist/README.md"),
  // Build type declarations
  cmd("tsc", ["--outDir", "./dist/", "--noEmit", "false", "--emitDeclarationOnly", "true", "--declaration", "true"]),
  // Build SFG with support for ESM modules
  cmd("tsc", ["--outDir", "./dist/esm", "--noEmit", "false", "--module", "esnext"])
    .then(() => rename("./dist/esm", ".mjs"))
    .then(massModuleFix),
  // Build SFG with support for CommonJS modules
  cmd("tsc", ["--outDir", "./dist/cjs", "--noEmit", "false", "--module", "commonjs"])
    .then(() => rename("./dist/cjs", ".cjs"))
    .then(massModuleFix),
]);

// Modify `package.json`'s `exports` field to treat folders right.
await supportFolders("./dist/package.json", "./dist/esm", "index.mjs");

process.exit(0);

// ---
// Tasks
// ---

async function packageJson() {
  const {
    name,
    version,
    description,
    author,
    homepage,
    license,
    keywords,
    files,
    repository,
    bugs,
    engines,
    main,
    module,
    types,
    exports,
    dependencies,
    optionalDependencies,
  } = json;

  const destPackage = {
    name,
    version,
    description,
    author,
    homepage,
    license,
    keywords,
    files,
    repository,
    bugs,
    engines,
    main,
    module,
    types,
    exports,
    dependencies,
    optionalDependencies,
  };

  await fs.writeFile("./dist/package.json", JSON.stringify(destPackage, null, 2));
}

/**
 * `cmd` is used as a wrapper for executiong shell commands.
 */
function cmd(command, args) {
  const child = child_process.spawn(command, args, { stdio: "inherit" });
  return new Promise((resolve) => child.on("exit", resolve));
}

/**
 * `rename` is used to rename all files in a folder `target`
 * from having the `.js` extension to the `extension` extension.
 *
 * It also returns a list of every file renamed.
 */
async function rename(target, extension) {
  const info = await fs.stat(target);
  if (info.isFile() && target.endsWith(".js")) {
    const newName = target.substr(0, target.length - ".js".length) + extension;
    await fs.rename(target, newName);
    return [newName];
  }

  const files = await fs.readdir(target);
  const fileNames = await Promise.all(files.map((name) => rename(target + "/" + name, extension)));
  return fileNames.reduce((as, bs) => [...as, ...bs]);
}

/**
 * Calls `patchModule` for every module file.
 */
async function massModuleFix(moduleFiles) {
  await Promise.all(moduleFiles.map(patchModule));
}

/**
 * Patches a single given file.
 *
 * ECMAScript modules introduced extremely strict module resolution: they do not
 * attempt to try resolve `require("./asdf")` into `./asdf.js` or `./asdf/index.js`.
 *
 * This function fixes that - it performs that resolution at compile time, resulting
 * in `require()` and `import ... from "..."` calls that are fully qualified.
 *
 * This solution is compatible in older versions of node, as well as for ESM modules
 * and newer environments, so we use it to ensure maximum compatibility.
 */
async function patchModule(fileName) {
  let contents = await fs.readFile(fileName, { encoding: "utf-8" });
  contents = await resolveImports(/require\("(.*)"\)/g, contents);
  contents = await resolveImports(/from "(.*)"/g, contents);
  await fs.writeFile(fileName, contents);
  return contents;

  /**
   * This function, given a regex, will find all matches of this regex.
   * For every match, it will compile-time resolve the import.
   * Then it returns a new string, with all the imports fully qualified.
   * @param {RegExp} regex
   */
  async function resolveImports(regex, contents) {
    let regexResults = regex.exec(contents);

    // we never imported anything - return the file as is.
    if (!regexResults) return contents;

    const workingDirectory = path.dirname(fileName);
    let fullyResolvedContents = "";
    let prevIndex = 0;

    do {
      // once we have matched the regex somewhere, we want to append all of file
      // from the last match to right before the current match.
      const untouched = contents.substring(prevIndex, regexResults.index);
      fullyResolvedContents += untouched;
      prevIndex = regex.lastIndex;

      // `regexResults[0]`: require("./asdf")
      // `regexResults[1]`: ./asdf
      const unqualifiedImport = regexResults[1];

      // if it doesn't start with `./` or `../`, it's not an import we can fully
      // resolve (as it's a module)
      if (!unqualifiedImport.startsWith(".")) {
        fullyResolvedContents += regexResults[0];
        continue;
      }

      let resolvedPath;

      findModule: {
        // maybe we already renamed it
        if ((resolvedPath = await tryExt(".cjs"))) break findModule;
        if ((resolvedPath = await tryExt(".mjs"))) break findModule;
        if ((resolvedPath = await tryExt("/index.cjs"))) break findModule;
        if ((resolvedPath = await tryExt("/index.mjs"))) break findModule;
        throw new Error(`i can't resolve ${unqualifiedImport} (${workingDirectory}) in ${fileName}`);
      }

      // change `require("./asdf")` => `require("./asdf.cjs")`
      const importRegex = regexResults[0].replace(unqualifiedImport, resolvedPath);
      fullyResolvedContents += importRegex;

      /**
       * Given a file extension, it will attempt to append that extension to the
       * module import and try to find a file at that path.
       *
       * If it finds a file at that path, it returns the module name plus the
       * file extension. If it doesn't, it returns a falsy value.
       */
      async function tryExt(extension) {
        const qualifiedImport = unqualifiedImport + extension;
        const resolvedImport = path.resolve(workingDirectory, qualifiedImport);

        return (await fileExistsAt(resolvedImport)) && qualifiedImport;
      }
    } while ((regexResults = regex.exec(contents)));

    // after the last regex match, there may still be more data in the file to
    // append.
    fullyResolvedContents += contents.substring(prevIndex);
    return fullyResolvedContents;
  }

  function fileExistsAt(module) {
    const file = path.resolve(fileName, module);
    return fileExists(file);
  }
}

/**
 * Allows users of the library to import folders as if they were `index.js` files.
 */
async function supportFolders(packageJsonPath, targetDirectory, indexFile) {
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath));

  // get all the directories that have an `index.js` module
  const directories = await listDirectories(targetDirectory);

  const exportsKeys = directories
    // remove `./dist/esm/` from the path
    .map((folder) => folder.substring(targetDirectory.length))
    // get rid of empty string
    .filter(Boolean)
    // get rid of leading `/`
    .map((name) => name.substring(1));

  // add `@smiley-face-game/api/net` and `@smiley-face-game/api/net/`
  // as valid imports
  for (const path of exportsKeys) {
    // support `@smiley-face-game/api/net` via exports rule
    packageJson.exports["./" + path] = {
      require: `./cjs/${path}/index.cjs`,
      default: `./esm/${path}/index.mjs`,
    };

    // also, create a `.cjs` and `.mjs` file that are copies of the `index`
    // this is to support importing `@smiley-face-game/api/net/`, as it
    // (ab)uses the `./*: ./*.cjs` rule.
    //
    // using a forward slash on the path is illegal for some reason? oh well
    await fs.copyFile(`./dist/cjs/${path}/index.cjs`, `./dist/cjs/${path}/.cjs`);
    await fs.copyFile(`./dist/esm/${path}/index.mjs`, `./dist/esm/${path}/.mjs`);
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  return;

  async function listDirectories(folder) {
    // list all files
    const fileEntries = await fs.readdir(folder);

    // filter out the directories
    const directories = (
      await Promise.all(
        // abusing promise flatmap lol
        fileEntries.map(async (fileEntry) => {
          const fullPath = `${folder}/${fileEntry}`;

          const stats = await fs.stat(fullPath);
          return stats.isDirectory() && fullPath;
        })
      )
    ).filter(Boolean);

    // only consider this directory if we have an index file
    const ourselves = [];
    if (await fileExists(folder + "/" + indexFile)) {
      ourselves.push(folder);
    }

    // return all child dirs
    const childDirectories = await Promise.all([ourselves, ...directories.map(listDirectories)]);
    return childDirectories.reduce((as, bs) => [...as, ...bs]);
  }
}

async function fileExists(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isFile();
  } catch {
    return false;
  }
}
