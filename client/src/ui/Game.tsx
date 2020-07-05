import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { globalVariableParkour, LoadingScene } from "../scenes/loading/LoadingScene";
import { Grid } from "@material-ui/core";
import Phaser from "phaser";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { WorldScene } from "../scenes/world/WorldScene";
import isProduction from "../isProduction";
import { makeStyles } from "@material-ui/core/styles";

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
      debug: isProduction ? false : true,
    },
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

const useStyles = makeStyles({
  uiOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  uiGameOverlay: {
    width: "1280px",
    height: "720px",
    position: "relative",
  },
  blockbar: {
    position: 'absolute',
    left: '25%',
    width: '50%',
    height: 48,
    backgroundColor: '#8A8A8A',
    bottom: 0,
  },
  block: {
    pointerEvents: 'all',
    backgroundColor: 'green',
    '&:hover': {
      backgroundColor: 'red'
    }
  }
});

interface IGameProps {
  gameId: string;
}

const Game: React.FC<IGameProps> = (props) => {
  const gameRef = useRef<HTMLDivElement>();
  const styles = useStyles();

  useEffect(() => {
    // disable right click for context menu
    gameRef.current.oncontextmenu = () => false;

    // idk how to send state to the initial scene of phaser, so let's do some GLOBAL VARIABLE PARKOUR!
    globalVariableParkour.worldId = props.gameId;

    // start game
    const game = new Phaser.Game({ ...config, parent: gameRef.current });
  }, []);

  return (
    <>
      <Grid container item justify="center">
        <div ref={gameRef} />
      </Grid>
      <Grid className={styles.uiOverlay} container item justify="center">
        <div className={styles.uiGameOverlay}>
          <div className={styles.blockbar}>
            <Grid container justify="space-evenly">
              <Grid className={styles.block} item xs={1}>
                <span>`</span>
              </Grid>
              <Grid className={styles.block} item xs={1}>
                <span>1</span>
              </Grid>
              <Grid className={styles.block} item xs={1}>
                <span>2</span>
              </Grid>
              <Grid className={styles.block} item xs={1}>
                <span>3</span>
              </Grid>
              <Grid className={styles.block} item xs={1}>
                <span>4</span>
              </Grid>
              <Grid className={styles.block} item xs={1}>
                <span>5</span>
              </Grid>
              <Grid className={styles.block} item xs={1}>
                <span>6</span>
              </Grid>
              <Grid item xs={1}>
                <span>7</span>
              </Grid>
              <Grid item xs={1}>
                <span>8</span>
              </Grid>
              <Grid item xs={1}>
                <span>9</span>
              </Grid>
              <Grid item xs={1}>
                <span>0</span>
              </Grid>
              <Grid item xs={1}>
                <span>-</span>
              </Grid>
            </Grid>
          </div>
        </div>
      </Grid>
    </>
  );
};

export default Game;
