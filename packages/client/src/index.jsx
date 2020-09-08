//@ts-check
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./ui/App";

import events from "@/game/events";
const eventSystem = events();
eventSystem.keyboard.trigger({}, function Outside() {});
eventSystem.mouse.trigger({}, function AnotherOutsider() {});

if (false) ReactDOM.render(<App />, document.getElementById("root"));
