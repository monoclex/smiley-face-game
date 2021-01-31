/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    src: "/",
    "../api/src": "/@smiley-face-game/api",
    // we re-route mdi-material-ui to something not in common so we can manipulate it via a plugin
    // and thus, fix some hacky behavior
    "../../node_modules/mdi-material-ui": "/mdi-material-ui",
  },
  alias: {
    "@smiley-face-game/api": "../api/src/",
    // see above comment about mdi-material-ui
    "mdi-material-ui": "../../node_modules/mdi-material-ui",
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    ["./snowpack-plugin-sucrase.js", { transforms: ["typescript", "jsx"] }],
    "./snowpack-plugin-svgr.js",
    "./snowpack-plugin-fix-mdi-material-ui.js",
  ],
  routes: [
    // get react router to work, otherwise it can't find any path
    { match: "routes", src: ".*", dest: "/index.html" },
  ],
  packageOptions: {
    env: {
      NODE_ENV: "development",
      DEV: true,
    },
  },
  devOptions: {
    port: 5000,
    // snowpack has a "dev console dashboard" that interferes with parallel logging
    output: "stream",
  },
};
