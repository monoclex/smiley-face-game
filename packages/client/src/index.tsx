import "regenerator-runtime";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./ui/App";

ReactDOM.render(<App />, document.getElementById("root"));

// enable HMR (hot module reloading)
if (module.hot) {
  // if (import.meta.hot) {
  module.hot.accept(); // import.meta.hot.accept();
}
