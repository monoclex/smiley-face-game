import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { useDev } from "@smiley-face-game/api";
import { rewriteHost } from "@smiley-face-game/api/net/endpoints";
import { serverMode } from "./isProduction";
import { routesRewritten } from "./rewritten";
import whyDidYouRender from "@welldone-software/why-did-you-render";

if (serverMode === "localhost") {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    titleColor: "red",
    trackHooks: true,
    logOwnerReasons: true,
    logOnDifferentValues: true,
  });
  rewriteHost((endpoint) => ({ ...endpoint, host: window.location.hostname + ":5265/v1" }));
} else if (serverMode === "development") {
  useDev();
} else if (serverMode === "production") {
  // production servers are the default
}

routesRewritten.resolve(undefined);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// enable HMR (hot module reloading)
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
