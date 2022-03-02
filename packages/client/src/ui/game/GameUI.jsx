//@ts-check
import React, { Suspense, useState } from "react";
import { Grid, styled } from "@mui/material";
//import Split from "react-split-grid";
import Split from "react-split";

import Chat from "./chat/Chat";
import BlockBar from "./blockbar/BlockBar";
import PlayerList from "./playerlist/PlayerList";
import MobileControls from "./MobileControls";
import WorldSettingsButton from "./WorldSettingsButton";
import GodModeButton from "./GodModeButton";
import Sign from "./sign/Sign";
import SoundButton from "./SoundButton";
import { gameRunningState } from "../../bridge/state";
import minimapimage from "../../assets/minimap.png";

const RootGrid = styled(Grid)({
  width: "100vw",
  height: "100vh",
  backgroundColor: "black",
});

const GrayFilled = styled(Grid)({
  borderStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "rgb(48,48,48)",
});

const BlackFilledScrollDiv = styled("div")({
  maxHeight: "max-content",
  borderLeftStyle: "solid",
  borderColor: "rgb(123,123,123)",
  borderWidth: "1px",
  backgroundColor: "black",
});

const BlackFilled = styled("div")({
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

function MinimapHerePlease() {
  // TODO: returns a canvas that renders in-game minimap
  return <img src={minimapimage} />;
}

export default function GameUI({ children: gameCanvas }) {
  const gameRunning = gameRunningState.useValue();
  if (gameRunning === false) throw new DisconnectError();

  // TODO: come up with a better way to store local game state stuff (and probs better structure too)
  // obviously wrapped in a nice manager hook (useLocalGameState())
  // eventually this should be stored on the server
  const [localGameState] = useState(
    () =>
      // @ts-ignore
      JSON.parse(localStorage.getItem("local_game_state")) || {
        ui: {
          layout: {
            rightSidebar: {
              sizes: [25, 60, 15],
            },
          },
        },
      }
  );

  const saveRightSidebarLayout = (sizes) => {
    localStorage.setItem(
      "local_game_state",
      JSON.stringify({
        ...localGameState,
        ui: { layout: { rightSidebar: { sizes } } },
      })
    );
  };

  // if you're trying to do UI design, see "uncomment me" in packages/server/src/RoomManager.ts
  // that way you don't have to constanttly create a new room

  return (
    <>
      <Sign />
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

        <Split
          direction="vertical"
          sizes={localGameState.ui.layout.rightSidebar.sizes}
          onDragEnd={saveRightSidebarLayout}
        >
          <BlackFilled>
            <Suspense fallback={null}>
              <PlayerList />
            </Suspense>
          </BlackFilled>

          <BlackFilledScrollDiv>
            <Chat />
          </BlackFilledScrollDiv>

          <BlackFilled>
            {/* thinking of a toolbar here for the minimap too */}
            {/* the toolbar would have options like reseting zoom/pan, popping it out, taking screenshots, etc */}
            <MinimapHerePlease />
            {/* maybe a second toolbar here for settings, go to lobby, etc, but might get a bit too cluttered? */}
            {/* might keep it in blockbar, we'll see */}
          </BlackFilled>
        </Split>
      </RootGrid>
    </>
  );
}
