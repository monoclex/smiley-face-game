// /--------------------------------------------------\
// | COPY PASTED FROM Game.jsx, MUST CLEAN THIS LATER |
// \--------------------------------------------------/

//@ts-check
import * as React from "react";
import * as qs from "query-string";
import { useEffect, useRef, useState } from "react";
import { globalVariableParkour, LoadingScene } from "../../scenes/loading/LoadingScene";
import { Grid, AppBar, Toolbar, Typography } from "@material-ui/core";
import Phaser from "phaser";
//@ts-ignore
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { WorldScene } from "../../scenes/world/WorldScene";
import isProduction from "../../isProduction";
import { makeStyles } from "@material-ui/core/styles";
import { updatePrimary } from "../redux/actionCreators/blockBar";
import { connect } from "react-redux";
import BlockBar from "@/ui/game/blockbar/BlockBar";
import ChatBar from "@/ui/game/chatbar/ChatBar";

export const config = {
  pixelArt: true,
  type: Phaser.AUTO,
  title: "Smiley Face Game",
  version: "0.1.0",
  width: window.innerWidth,
  height: window.innerHeight,
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
  game: {
    lineHeight: "1px",
  },
  uiOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  blockbar: {
    position: "absolute",
    left: "25%",
    width: "50%",
    bottom: 0,
    margin: 0,
    padding: 0,
  },
});

const Game = ({ match: { params: { roomId } }, location: { search }, updatePrimary, selectedSlot, loader }) => {
  let { token, name, width, height, type, id } = qs.parse(search);

  width = parseInt(width);
  height = parseInt(height);
  id = roomId || id;

  const gameRef = useRef();
  const styles = useStyles();

  useEffect(() => {
    // disable right click for context menu
    gameRef.current.oncontextmenu = () => false;

    // idk how to send state to the initial scene of phaser, so let's do some GLOBAL VARIABLE PARKOUR!
    globalVariableParkour.token = token;
    globalVariableParkour.type = type;
    globalVariableParkour.name = name;
    globalVariableParkour.width = width;
    globalVariableParkour.height = height;
    globalVariableParkour.id = id;

    // start game
    const game = new Phaser.Game({ ...config, parent: gameRef.current });

    window.addEventListener("resize", () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    });
  }, []);

  return (
    <>
      <Grid container justify="center">
        <div className={styles.game} ref={gameRef} />
      </Grid>
      <Grid className={styles.uiOverlay} container justify="center">
        <div className={styles.blockbar}>
          <BlockBar onBlockSelected={updatePrimary} selected={selectedSlot} loader={loader} />
        </div>

        <ChatBar />
      </Grid>
    </>
  );
};

const mapState = ({ blockBar }) => ({
  selectedSlot: blockBar.selected,
  loader: blockBar.loader,
});

const mapDispatch = {
  updatePrimary,
};

export default connect(mapState, mapDispatch)(Game);
