/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    src: "/",
    "../api/src": "/@smiley-face-game/api",
  },
  alias: {
    "@smiley-face-game/api": "../api/src/",
    // "@smiley-face-game/api": "/__snowpack_monorepo_package/api/",
    // "@smiley-face-game/api/endpoints": "/__snowpack_monorepo_package/api/endpoints.js",
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-typescript",
    "./import-svg-as-react-component-snowpack-plugin.js",
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
