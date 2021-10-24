import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { rewriteHost, useDev } from "@smiley-face-game/api/endpoints";
import { serverMode } from "./isProduction";
import { routesRewritten } from "./rewritten";

if (serverMode === "localhost") {
  rewriteHost((endpoint) => ({ ...endpoint, host: "localhost:8080/v1" }));
} else if (serverMode === "development") {
  useDev();
} else if (serverMode === "production") {
  // production servers are the default
}

routesRewritten.resolve(undefined);

ReactDOM.render(<App />, document.getElementById("root"));

// enable HMR (hot module reloading)
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
