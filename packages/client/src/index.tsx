import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { rewriteHost } from "@smiley-face-game/api/endpoints";
import isProduction, { isDev } from "./isProduction";
import { routesRewritten } from "./rewritten";

if (isProduction) {
  rewriteHost((endpoint) =>
    endpoint.host.startsWith("ws")
      ? { ...endpoint, host: (isDev ? "dev-" : "") + "ws-api.sirjosh3917.com/smiley-face-game/v1" }
      : { ...endpoint, host: "api.sirjosh3917.com/smiley-face-game" + (isDev ? "/dev" : "") + "/v1" }
  );
} else {
  rewriteHost((endpoint) => ({ ...endpoint, host: "localhost:8080/v1" }));
}

routesRewritten.resolve(undefined);

ReactDOM.render(<App />, document.getElementById("root"));

// enable HMR (hot module reloading)
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
