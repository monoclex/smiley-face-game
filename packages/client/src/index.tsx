import "regenerator-runtime";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./ui/App";
import { rewriteHost } from "@smiley-face-game/common/endpoints";
import isProduction, { isDev } from "./isProduction";

console.log("isProduction", isProduction, "isDev", isDev);
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
