import React from "react";
import ReactDOM from "react-dom";
import App from "./ui/App";
import { useDev } from "@smiley-face-game/api";
import { rewriteHost } from "@smiley-face-game/api/net/endpoints";
import { routesRewritten } from "./rewritten";

if (import.meta.env.SERVER_MODE === "localhost") {
  rewriteHost((endpoint) => ({ ...endpoint, host: window.location.hostname + ":5265/v1" }));

  import("@welldone-software/why-did-you-render").then(({ default: whyDidYouRender }) => {
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      titleColor: "red",
      trackHooks: true,
      logOwnerReasons: true,
      logOnDifferentValues: true,
    });

    render();
  });
} else if (import.meta.env.SERVER_MODE === "development") {
  useDev();
  render();
} else if (import.meta.env.SERVER_MODE === "production") {
  // production servers are the default
  render();
}

routesRewritten.resolve(undefined);

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// enable HMR (hot module reloading)
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
