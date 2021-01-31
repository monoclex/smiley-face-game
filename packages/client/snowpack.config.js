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
    "mdi-material-ui": "../../node_modules/mdi-material-ui",
    // "@smiley-face-game/api": "/__snowpack_monorepo_package/api/",
    // "@smiley-face-game/api/endpoints": "/__snowpack_monorepo_package/api/endpoints.js",
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    ["./snowpack-plugin-sucrase.js", { transforms: ["typescript", "jsx"] }],
    "./import-svg-as-react-component-snowpack-plugin.js",
    "./snowpack-plugin-fix-mdi-material-ui.js",
  ],
  routes: [
    /* Enable an SPA Fallback in development: */
    { match: "routes", src: ".*", dest: "/index.html" },
  ],
  optimize: {
    /* Example: Bundle your final build: */
    // "bundle": true,
  },
  packageOptions: {
    env: {
      NODE_ENV: "development",
      DEV: true,
    },
  },
  devOptions: {
    port: 5000,
    output: "stream",
  },
  buildOptions: {
    /* ... */
  },
};
