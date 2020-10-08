import React from "react";
import ReactDOM from "react-dom";
import { App } from "./ui/App";

ReactDOM.render(<App />, document.getElementById("root"));

// enable HMR (hot module reloading)
if (import.meta.hot) {
  import.meta.hot.accept();
}
