//@ts-check
import React, { Suspense } from "react";
import { Grid, styled } from "@mui/material";
import Chat from "./chat/Chat";
import BlockBar from "./blockbar/BlockBar";
import PlayerList from "./playerlist/PlayerList";
import MobileControls from "./MobileControls";
import WorldSettingsButton from "./WorldSettingsButton";

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

export default function GameUI({ children: gameCanvas }) {
  // if you're trying to do UI design, see "uncomment me" in packages/server/src/RoomManager.ts
  // that way you don't have to constanttly create a new room

  return (
    <>
      <RootGrid container direction="row" alignItems="stretch" justifyContent="flex-end">
        <Grid item container direction="column" alignItems="stretch" justifyContent="flex-end" xs>
          <PlayWindow item xs>
            {gameCanvas}
          </PlayWindow>
          <GrayFilled item xs={2}>
            <Grid container item direction="row" alignItems="stretch">
              <Grid container item xs={3} justifyContent="center">
                <MobileControls />
              </Grid>
              <Grid container item xs={6} justifyContent="flex-end">
                <Suspense fallback={null}>
                  <BlockBar />
                </Suspense>
              </Grid>
              <Grid container item xs={3} alignItems="flex-end">
                <WorldSettingsButton />
              </Grid>
            </Grid>
          </GrayFilled>
        </Grid>
        <Grid item xs={2} container direction="column" alignItems="stretch" justifyContent="">
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
