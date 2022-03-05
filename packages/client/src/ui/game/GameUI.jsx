//@ts-check
import React, { Suspense } from "react";
import { Grid, styled } from "@mui/material";
import Chat from "./chat/Chat";
import BlockBar from "./blockbar/BlockBar";
import PlayerList from "./playerlist/PlayerList";
import MobileControls from "./MobileControls";
import WorldSettingsButton from "./WorldSettingsButton";
import GodModeButton from "./GodModeButton";
import Sign from "./sign/Sign";
import SoundButton from "./SoundButton";
import { gameRunningState } from "../../bridge/state";
import BlockInspector from "./BlockInspector";

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
  maxHeight: "max-content",
  borderLeftStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "black",
});

const BlackFilled = styled(Grid)({
  borderLeftStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "black",
});

const PlayWindow = styled(Grid)({
  backgroundColor: "black",
});

class DisconnectError extends Error {
  constructor() {
    super();
    this.name = "DisconnectError";
  }
}

export default function GameUI({ children: gameCanvas }) {
  const gameRunning = gameRunningState.useValue();
  if (gameRunning === false) throw new DisconnectError();

  // if you're trying to do UI design, see "uncomment me" in packages/server/src/RoomManager.ts
  // that way you don't have to constanttly create a new room

  return (
    <>
      <Sign />
      <BlockInspector />
      <RootGrid container direction="row" alignItems="stretch" justifyContent="flex-end">
        <Grid item container direction="column" alignItems="stretch" justifyContent="flex-end" xs>
          <PlayWindow item xs>
            {gameCanvas}
          </PlayWindow>
          <GrayFilled item xs="auto">
            <Grid
              container
              item
              direction="row"
              justifyContent="space-between"
              alignItems="stretch"
              wrap="nowrap"
            >
              <Grid container item justifyContent="center">
                <MobileControls />
              </Grid>
              <Grid container item xs="auto">
                <Suspense fallback={null}>
                  <BlockBar />
                </Suspense>
              </Grid>
              <Grid container item alignItems="flex-end">
                <WorldSettingsButton />
                <Suspense fallback={null}>
                  <GodModeButton />
                </Suspense>
                <SoundButton />
              </Grid>
            </Grid>
          </GrayFilled>
        </Grid>
        <Grid item xs={2} container direction="column" alignItems="stretch">
          <BlackFilled item xs={2}>
            <Suspense fallback={null}>
              <PlayerList />
            </Suspense>
          </BlackFilled>
          <BlackFilledScrollDiv item xs>
            <Chat />
          </BlackFilledScrollDiv>
        </Grid>
      </RootGrid>
    </>
  );
}
