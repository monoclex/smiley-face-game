//@ts-check
import React, { useLayoutEffect, useRef, useState } from "react";
import { Grid, styled } from "@mui/material";
import Chat from "../../ui/game/chat/Chat";
import BlockBar from "../../ui/game/blockbar/BlockBar";
import PlayerList from "../../ui/game/playerlist/PlayerList";
import MobileControls from "../game/MobileControls";
import WorldSettingsButton from "../game/WorldSettingsButton";
import { isDebugMode } from "../../isProduction";

const UiOverlay = styled(Grid)({
  // position: "absolute",
  // top: 0,
  // left: 0,
  // right: 0,
  // bottom: 0,
  // pointerEvents: "none",
});

const RootGrid = styled(Grid)({
  width: "100vw",
  height: "100vh",
});

const GrayFilled = styled(Grid)({
  borderStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "rgb(48,48,48)",
});

const BlackFilledScrollDiv = styled(Grid)({
  overflowY: "scroll",
  maxHeight: "max-content",
  borderLeftStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "black",
  padding: "1em",
});

const BlackFilled = styled(Grid)({
  borderLeftStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "black",
  padding: "1em",
});

const PlayWindow = styled(Grid)({
  backgroundColor: "black",
});

export default function PlayPage({ children }) {
  // if you're trying to do UI design, see "uncomment me" in packages/server/src/RoomManager.ts
  // that way you don't have to constanttly create a new room

  return (
    <>
      <RootGrid container direction="row" alignItems="stretch" justifyContent="flex-end">
        <Grid item container direction="column" alignItems="stretch" justifyContent="flex-end" xs>
          <PlayWindow item xs>
            {children}
          </PlayWindow>
          <GrayFilled item xs={2}>
            <h1> block bar </h1>
          </GrayFilled>
        </Grid>
        <Grid item xs={2} container direction="column" alignItems="stretch" justifyContent="">
          <BlackFilled item xs={2}>
            <h1> chat window </h1>
          </BlackFilled>
          <BlackFilledScrollDiv item xs>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
            <p>a</p>
          </BlackFilledScrollDiv>
        </Grid>
      </RootGrid>
    </>
    // <>
    //   <UiOverlay container alignItems="stretch">
    //     <Grid container item direction="row" alignItems="stretch">
    //       <Grid container item xs={3} justifyContent="center">
    //         <MobileControls />
    //       </Grid>
    //       <Grid container item xs={6} justifyContent="flex-end">
    //         <BlockBar loader={(id) => game.blockBar.load(id)} />
    //       </Grid>
    //       <Grid container item xs={3} alignItems="flex-end">
    //         <WorldSettingsButton />
    //       </Grid>
    //     </Grid>
    //     {/* the 100% - 100px comes from the joystick which is 100px. this is awful */}
    //     {/* oh, and to add to the awfulness, we subtract like 13 more pixels just incase it overflows because why not */}
    //     <Grid container item direction="row" alignItems="stretch" style={{ height: "calc(100% - 100px - 13px)" }}>
    //       <Grid item xs={6} container alignItems="flex-end">
    //         <Chat />
    //       </Grid>
    //       <Grid item xs={6} container direction="column" justifyContent="center" alignItems="flex-end">
    //         <PlayerList />
    //       </Grid>
    //     </Grid>
    //   </UiOverlay>
    // </>
  );
}
