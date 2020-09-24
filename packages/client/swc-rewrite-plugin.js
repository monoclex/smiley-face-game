const Visitor = require("@swc/core/Visitor").default;
const path = require("path");

/** @param {import("@swc/core").Program} program */
module.exports = (program) => {
  for (const item of program.body) {
    if (item.type !== "ImportDeclaration") continue;

    const declaration = item;

    if (declaration.source.value.startsWith("@smiley-face-game/api")) {
      declaration.source.value = declaration.source.value.replace("@smiley-face-game/api", path.resolve(__dirname, "../api/src"));
      continue;
    }
    
    if (declaration.source.value.startsWith("@/")) {
      declaration.source.value = declaration.source.value.replace("@/", path.resolve(__dirname, "./src/") + "/")
      continue;
    }
  }

  return program;
};
