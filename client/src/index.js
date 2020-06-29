import Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { LoadingScene } from "./scenes/loading/LoadingScene";
import { WorldScene } from "./scenes/world/WorldScene";

import React from "react";
import ReactDOM from "react-dom";
import { App } from "./ui/App.tsx";
import isProduction from "./isProduction";

export const config = {
  type: Phaser.AUTO,
  title: "Smiley Face Game",
  version: "0.1.0",
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: "game",
  scene: [LoadingScene, WorldScene],
  backgroundColor: "#000000",

  physics: {
    default: "matter",
    matter: {
      // toggles hitboxes around objects
      // if we're not in production, we want to see them
      debug: isProduction ? false : true
    }
  },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision", // Where to store in the Scene, e.g. scene.matterCollision
      },
    ],
  },
};

ReactDOM.render(<App config={config} />, document.getElementById("root"));
