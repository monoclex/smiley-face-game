module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
    ["@babel/preset-react", { development: true }],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-optional-chaining",
    [
      "module-resolver",
      {
        root: ["./"],
        alias: {
          "@smiley-face-game/common": "./packages/common/src",
        },
      },
    ],
  ],
};
