// /--------------------------------------------------\
// | COPY PASTED FROM Game.jsx, MUST CLEAN THIS LATER |
// \--------------------------------------------------/

//@ts-check
import Phaser from "phaser";
import qs from "query-string";
import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { globalVariableParkour, LoadingScene } from "@/scenes/loading/LoadingScene";
import { WorldScene } from "@/scenes/world/WorldScene";
import { updatePrimary } from "@/ui/redux/actionCreators/blockBar";
import ChatBar from "@/ui/game/chatbar/ChatBar";
import BlockBar from "@/ui/game/blockbar/BlockBar";
import history from "@/ui/history";
import isProduction from "@/isProduction";

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
    width: "100%",
    bottom: 0,
    margin: 0,
    padding: 0,
  },
});

const Game = ({ match: { params: { roomId } }, location: { search }, updatePrimary, selectedSlot, loader }) => {
  const token = localStorage.getItem("token");

  if (token === null) {
    history.push("/");
    return null;
  }

  let { name, width, height, type, id } = qs.parse(search);

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
    globalVariableParkour.onId = (id) => {
      // https://stackoverflow.com/a/61596862/3780113
      // replace the ID so that if the user is creating a dynamic world it looks a bit nicer
      window.history.replaceState(null, document.title, `/games/${id}?type=${type ?? "dynamic"}`);
    }

    // start game
    const game = new Phaser.Game({ ...config, parent: gameRef.current });

    const listener = window.addEventListener("resize", () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    });

    return function cleanup() {
      window.removeEventListener("resize", listener);
      game.destroy(true);
    }
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
