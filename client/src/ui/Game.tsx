import * as React from "react";
import { useEffect } from "react";
import { globalVariableParkour, LoadingScene } from "../scenes/loading/LoadingScene";
import { Grid } from "@material-ui/core";
import Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { WorldScene } from "../scenes/world/WorldScene";
import isProduction from "../isProduction";

export const config = {
  type: Phaser.AUTO,
  title: "Smiley Face Game",
  version: "0.1.0",
  width: 1280,
  height: 720,
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

interface IGameProps {
  gameId: string;
}

const Game: React.FC<IGameProps> = (props) => {
  const gameRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    // disable right click for context menu
    gameRef.current.oncontextmenu = () => false;

    // idk how to send state to the initial scene of phaser, so let's do some GLOBAL VARIABLE PARKOUR!
    globalVariableParkour.worldId = props.gameId;

    // start game
    const game = new Phaser.Game({ ...config, parent: gameRef.current });
  }, []);

  return (
    <Grid container item justify="center">
      <div ref={gameRef} />
    </Grid>
  );
}

export default Game;
