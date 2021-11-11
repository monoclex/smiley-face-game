//@ts-check
import React, { useEffect } from "react";
import { Grid, styled } from "@mui/material";
import Chat from "../../ui/game/chat/Chat";
import BlockBar from "../../ui/game/blockbar/BlockBar";
import PlayerList from "../../ui/game/playerlist/PlayerList";
import MobileControls from "../game/MobileControls";
import WorldSettingsButton from "../game/WorldSettingsButton";
import state from "../../bridge/state";

// TODO: better name
const GameContainer = styled("div")({
  lineHeight: "1px",
});

const UiOverlay = styled(Grid)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: "none",
});

/**
 * @param {{ game: import("../../game/client/ClientGame").default, gameElement: HTMLElement }} param0
 */
export default function PlayPage({ game, gameElement }) {
  useEffect(() => {
    const listener = () => game.renderer.resize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  useEffect(() => {
    const loop = state.loop;

    requestAnimationFrame((elapsed) => {
      // timeStart = elapsed;
      game.tick(0);
      requestAnimationFrame(loop);
    });
  }, []);

  return (
    <>
      {/* <GameContainer ref={(elem) => elem && elem.appendChild(gameElement)} /> */}
      <UiOverlay container direction="column-reverse" alignItems="stretch">
        <Grid container item direction="row" alignItems="stretch">
          <Grid container item xs={3} justifyContent="center">
            <MobileControls />
          </Grid>
          <Grid container item xs={6} justifyContent="flex-end">
            <BlockBar loader={(id) => game.blockBar.load(id)} />
          </Grid>
          <Grid container item xs={3} alignItems="flex-end">
            <WorldSettingsButton />
          </Grid>
        </Grid>
        {/* the 100% - 100px comes from the joystick which is 100px. this is awful */}
        {/* oh, and to add to the awfulness, we subtract like 13 more pixels just incase it overflows because why not */}
        <Grid container item direction="row" alignItems="stretch" style={{ height: "calc(100% - 100px - 13px)" }}>
          <Grid item xs={6} container alignItems="flex-end">
            <Chat />
          </Grid>
          <Grid item xs={6} container direction="column" justifyContent="center" alignItems="flex-end">
            <PlayerList />
          </Grid>
        </Grid>
      </UiOverlay>
    </>
  );
}
