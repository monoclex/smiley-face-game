//@ts-check
import React from "react";
import { Grid, styled } from "@mui/material";
import Chat from "./chat/Chat";
import BlockBar from "./blockbar/BlockBar";
import PlayerList from "./playerlist/PlayerList";
import MobileControls from "./MobileControls";
import WorldSettingsButton from "./WorldSettingsButton";
import GodModeButton from "./GodModeButton";
import Sign from "./sign/Sign";
import SoundButton from "./SoundButton";
import ExitButton from "./ExitButton";
import { gameRunningState } from "../../bridge/state";
import BlockInspector from "./BlockInspector";
import SwitchIdWindow from "./SwitchIdWindow";
import GameArea from "./GameArea";

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

export default function GameUI() {
  const gameRunning = gameRunningState.useValue();
  if (gameRunning === false) throw new DisconnectError();

  // if you're trying to do UI design, see "uncomment me" in packages/server/src/RoomManager.ts
  // that way you don't have to constanttly create a new room

  return (
    <>
      <Sign />
      <SwitchIdWindow />
      <BlockInspector />
      <RootGrid container direction="row" alignItems="stretch" justifyContent="flex-end">
        <Grid item container direction="column" alignItems="stretch" justifyContent="flex-end" xs>
          <PlayWindow item xs>
            <GameArea />
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
                <BlockBar />
              </Grid>
              <Grid container item alignItems="flex-end">
                <WorldSettingsButton />
                <GodModeButton />
                <SoundButton />
                <ExitButton />
              </Grid>
            </Grid>
          </GrayFilled>
        </Grid>
        <Grid item xs={2} container direction="column" alignItems="stretch">
          <BlackFilled item xs={2}>
            <PlayerList />
          </BlackFilled>
          <BlackFilledScrollDiv item xs>
            <Chat />
          </BlackFilledScrollDiv>
        </Grid>
      </RootGrid>
    </>
  );
}
