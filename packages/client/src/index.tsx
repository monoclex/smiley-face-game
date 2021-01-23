import "regenerator-runtime";
import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { rewriteHost } from "@smiley-face-game/api/endpoints";
import isProduction, { isDev } from "./isProduction";

// == we do this here because having a file that exports `pixi-tilemap` before
// setting a global variable doesn't work, so let's set it *now* before we
// ever get in game ==
//
// pixi-tilemap is a special snowflake and badly needs `PIXI` to exist as a
// global the ordering of these imports is ***special***
//
// this imports `PIXI` and sets it as a global so you can import
// `pixi-tilemap` properly, making sure to only import the things needed.
// (i checked source)
import { utils } from "pixi.js";
window["PIXI"] = {
  //@ts-ignore
  utils: {
    createIndicesForQuads: utils.createIndicesForQuads,
  },
  CanvasRenderer: class {
    constructor() {
      alert("oh noes");
      throw new Error("pixi canvasrender shouldn't be called");
    }
    static registerPlugin() {}
  },
};

if (isProduction) {
  rewriteHost((endpoint) =>
    endpoint.host.startsWith("ws")
      ? { ...endpoint, host: (isDev ? "dev-" : "") + "ws-api.sirjosh3917.com/smiley-face-game/v1" }
      : { ...endpoint, host: "api.sirjosh3917.com/smiley-face-game" + (isDev ? "/dev" : "") + "/v1" }
  );
} else {
  rewriteHost((endpoint) => ({ ...endpoint, host: "localhost:8080/v1" }));
}

ReactDOM.render(<App />, document.getElementById("root"));

// enable HMR (hot module reloading)
if (module.hot) {
  // if (import.meta.hot) {
  module.hot.accept(); // import.meta.hot.accept();
}
