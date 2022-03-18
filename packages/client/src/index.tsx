import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { useDev } from "@smiley-face-game/api";
import { rewriteHost, useTest } from "@smiley-face-game/api/net/endpoints";
import { routesRewritten } from "./rewritten";
import whyDidYouRender from "@welldone-software/why-did-you-render";

  whyDidYouRender(React, {
    trackAllPureComponents: true,
    titleColor: "red",
    trackHooks: true,
    logOwnerReasons: true,
    logOnDifferentValues: true,
  });
if (import.meta.env.SERVER_MODE === "localhost") {
  rewriteHost((endpoint) => ({ ...endpoint, host: window.location.hostname + ":5265/v1" }));
} else if (import.meta.env.SERVER_MODE === "development") {
  // useDev();
  useTest();
} else if (import.meta.env.SERVER_MODE === "production") {
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
