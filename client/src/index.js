import Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { LoadingScene } from "./scenes/loading/LoadingScene";
import { WorldScene } from "./scenes/world/WorldScene";

import React from "react";
import ReactDOM from "react-dom";
import { App } from "./ui/App.tsx";

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
  
  physics: { default: "matter", matter: { debug: true } },
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

// prevent right clicks from having the context menu show up
// document.getElementById('game').oncontextmenu = () => false;

// window.addEventListener("load", () => {
//   const game = new Phaser.Game(config);
// });

ReactDOM.render(<App config={config} />, document.getElementById("root"));