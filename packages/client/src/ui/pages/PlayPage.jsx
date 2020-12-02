// /--------------------------------------------------\
// | COPY PASTED FROM Game.jsx, MUST CLEAN THIS LATER |
// \--------------------------------------------------/

import qs from "query-string";
import { useRecoilState, useRecoilValue } from "recoil";
import React, { useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import { globalVariableParkour } from "../../game/LoadingScene";
import Chat from "../../ui/game/chat/Chat";
import BlockBar from "../../ui/game/blockbar/BlockBar";
import history from "../history";
import { isDev } from "../../isProduction";
import GameScene from "../../game/GameScene";
import { loadingState, loading as sharedGlobalLoading } from "../../recoil/atoms/loading";
import PlayerList from "../../ui/game/playerlist/PlayerList";
import { blockbarState } from "../../recoil/atoms/blockbar";
import currentPlayer from "../../recoil/selectors/currentPlayer";
import MobileControls from "../game/MobileControls";
import WorldSettings from "../game/WorldSettings";
import { Authentication } from "@smiley-face-game/api";
import { Renderer } from "pixi.js";
import { textures, makeClientConnectedGame } from "../../game/ClientGame";

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
  bottomLeft: {
    width: "100px",
    height: "100px",
    marginLeft: 1,
  },
});

const PlayPage = ({
  selectedSlot,
  loader,
  location: { search, state },
  match: {
    params: { roomId },
  },
}) => {
  // don't have to check if the token is valid because that will happen when we try to join the game
  const token = localStorage.getItem("token");
  if (token === null) {
    history.push("/");
    return null;
  }

  if (!state || !state.request) {
    // if the user navigates here naturally, we have to infer the state
    const { type } = qs.parse(search);
    state = {};
    state.request = "join";
    state.roomId = roomId;
    state.type = type;
  }

  const gameRef = useRef();
  const styles = useStyles();

  const [loading, setLoading] = useRecoilState(loadingState);
  const mainPlayer = useRecoilValue(currentPlayer);

  // this fixes a bug where because the blockbar might not be rendered before the game begins, not initializing the recoil blockbar state,
  // we have to use the recoil state so that it is guaranteed to get initialized before the game begins
  const _ = useRecoilState(blockbarState);

  useEffect(() => {
    // disable right click for context menu
    gameRef.current.oncontextmenu = () => false;

    // idk how to send state to the initial scene of phaser, so let's do some GLOBAL VARIABLE PARKOUR!

    let auth = new Authentication(token);
    globalVariableParkour.token = auth;
    let joinRequest =
      state.request === "create"
        ? { type: "dynamic", name: state.name, width: state.width, height: state.height }
        : { type: state.type, id: state.roomId };

    globalVariableParkour.onId = (id) => {
      // https://stackoverflow.com/a/61596862/3780113
      // replace the ID so that if the user is creating a dynamic world it looks a bit nicer
      window.history.replaceState(null, document.title, `/games/${id}?type=${state.type ?? "dynamic"}`);
    };

    // start game
    const renderer = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      view: gameRef.current,
    });

    let rafAnother = true;

    textures
      .load()
      .then(() => auth.connect(joinRequest))
      .then((connection) => {
        console.time("init");
        const game = makeClientConnectedGame(renderer, connection);
        let timeStart;
        const raf = (elapsed) => {
          if (!rafAnother) return;
          let delta = elapsed - timeStart;
          timeStart = elapsed;
          game.tick(delta);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame((elapsed) => {
          timeStart = elapsed;
          raf(elapsed);
        });
      });

    const listener = () => {
      renderer.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", listener);

    return function cleanup() {
      rafAnother = false;
      window.removeEventListener("resize", listener);
      sharedGlobalLoading.set({ failed: undefined, why: undefined });
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
          <span>{loading.why.toString()}</span>
          <button
            onClick={() => {
              setLoading({ failed: false });
              history.createGame({ name: "test", width: 50, height: 50 });
            }}
          >
            gclick here to make a a new roome
          </button>
        </Grid>
      )}
      <Grid container justify="center">
        <canvas className={styles.game} ref={gameRef} />
      </Grid>
      <Grid className={styles.uiOverlay} container direction="column-reverse" alignItems="stretch">
        <Grid container item direction="row" alignItems="stretch">
          <Grid container item xs={3} justify="center">
            <MobileControls />
          </Grid>
          <Grid container item xs={6} justify="flex-end">
            {loading.failed === false && mainPlayer !== undefined && mainPlayer.role !== "non" ? (
              <BlockBar loader={loader} />
            ) : null}
          </Grid>
          <Grid container item xs={3} alignItems="flex-end">
            <WorldSettings />
          </Grid>
        </Grid>
        {/* the 100% - 100px comes from the joystick which is 100px. this is awful */}
        {/* oh, and to add to the awfulness, we subtract like 13 more pixels just incase it overflows because why not */}
        <Grid container item direction="row" alignItems="stretch" style={{ height: "calc(100% - 100px - 13px)" }}>
          <Grid item xs={6} container alignItems="flex-end">
            <Chat />
          </Grid>
          <Grid item xs={6} container direction="column" justify="center" alignItems="flex-end">
            <PlayerList />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default PlayPage;
