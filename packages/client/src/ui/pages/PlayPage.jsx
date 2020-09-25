// /--------------------------------------------------\
// | COPY PASTED FROM Game.jsx, MUST CLEAN THIS LATER |
// \--------------------------------------------------/

//@ts-check
import Phaser from "phaser";
import qs from "query-string";
import { useRecoilState } from "recoil";
import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { globalVariableParkour, LoadingScene } from "@/scenes/loading/LoadingScene";
import { WorldScene } from "@/scenes/world/WorldScene";
import Chat from "@/ui/game/chat/Chat";
import BlockBar from "@/ui/game/blockbar/BlockBar";
import history from "@/ui/history";
import isProduction, { isDev } from "@/isProduction";
import GameScene from "@/game/GameScene";
import RecoilGameStateSync from "@/ui/game/recoil/RecoilGameStateSync";
import { chatState } from "@/recoil/atoms/chat";
import { loadingState } from "@/recoil/atoms/loading";

export const config = {
  pixelArt: true,
  type: Phaser.AUTO,
  title: "Smiley Face Game",
  version: "0.1.0",
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [LoadingScene, GameScene],
  backgroundColor: "#000000",

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: isDev,
      // toggles hitboxes around objects
      // if we're not in production, we want to see them
      // debug: isProduction ? false : true,
    },
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

const Game = ({
  selectedSlot,
  loader,
  location: { search, state },
  match: { params: { roomId } }
}) => {
  // don't have to check if the token is valid because that will happen when we try to join the game
  const token = localStorage.getItem("token");
  if (token === null) {
    history.push("/");
    return null;
  }

  if (!state || !state.request) { // if the user navigates here naturally, we have to infer the state
    const { type } = qs.parse(search);
    state = {};
    state.request = "join";
    state.roomId = roomId;
    state.type = type
  }

  const gameRef = useRef();
  const styles = useStyles();

  const [loading, setLoading] = useRecoilState(loadingState);

  useEffect(() => {
    // disable right click for context menu
    gameRef.current.oncontextmenu = () => false;

    // idk how to send state to the initial scene of phaser, so let's do some GLOBAL VARIABLE PARKOUR!

    // reset the variable
    globalVariableParkour.type = undefined;
    globalVariableParkour.token = undefined;
    globalVariableParkour.name = undefined;
    globalVariableParkour.width = undefined;
    globalVariableParkour.height = undefined;
    globalVariableParkour.id = undefined;

    globalVariableParkour.token = token;

    if (state.request === "create") {
      globalVariableParkour.type = "dynamic";
      globalVariableParkour.name = state.name;
      globalVariableParkour.width = state.width;
      globalVariableParkour.height = state.height;
    }
    else {
      globalVariableParkour.type = state.type;
      globalVariableParkour.id = state.roomId;
    }

    globalVariableParkour.onId = (id) => {
      // https://stackoverflow.com/a/61596862/3780113
      // replace the ID so that if the user is creating a dynamic world it looks a bit nicer
      window.history.replaceState(null, document.title, `/games/${id}?type=${state.type ?? "dynamic"}`);
    };

    // start game
    const game = new Phaser.Game({ ...config, parent: gameRef.current });
    window.game = game;

    const listener = window.addEventListener("resize", () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    });

    return function cleanup() {
      window.recoil.loading.setState({ failed: false, why: undefined });
      window.removeEventListener("resize", listener);
      game.destroy(true);
    };
  }, []);

  // just a hacky way to force the game to scale right on render
  // a bug occurs where the click position isn't correct after a user presses the "gclick here to make a new roome" button
  // so we force the game to resize on component render to hopefully tell phaser to correct the positioning
  if (window.game) {
    // when we immediately call this, the game isn't yet rendered
    // so by delaying it until after react completes rendering we can get it to fix itself
    setTimeout(() => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    }, 0);
  }

  return (
    <>
    {/* i tried to stick this in its own condition but i'm having a hard time figuring out what to do with `ref gameRef`
        react wants it to exist otherwise it throws an error during reset. */}
    {loading.failed && (
    <Grid container justify="center">
      <h1>game failed to load</h1>
      <span>{ loading.why.toString() }</span>
      <button onClick={() => { setLoading({ failed: false }); history.createGame({ name: "test", width: 50, height: 50 }) }}>
        gclick here to make a a new roome
      </button>
    </Grid>
    )}
      <Grid container justify="center">
        <div className={styles.game} ref={gameRef} />
      </Grid>
      <Grid className={styles.uiOverlay} container justify="center">
        <div className={styles.blockbar}>
          <BlockBar loader={loader} />
        </div>

        <Chat />
      </Grid>
    </>
  );
};

export default Game;
