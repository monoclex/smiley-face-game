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
import BlockBarNew from "./blockbar/BlockBarNew";

const GrayFilled = styled(Grid)({
  backgroundColor: "rgb(48,48,48)",
});

const BlackFilledScrollDiv = styled("div")({
  maxHeight: "max-content",
  backgroundColor: "black",
});

const BlackFilled = styled("div")({
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
  return (
    <img
      src={minimapimage}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
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
            split: {
              game_sidebar: [80, 20],
              game_blockbar: [50, 50],
              sidebar: [25, 60, 15],
            },
          },
        },
      }
  );

  const saveLayout = () => localStorage.setItem("local_game_state", JSON.stringify(localGameState));
  const saveGameSidebarLayout = (sizes) => {
    localGameState.ui.layout.split.game_sidebar = sizes;
    saveLayout();
  };
  const saveGameBlockbarLayout = (sizes) => {
    localGameState.ui.layout.split.game_blockbar = sizes;
    saveLayout();
  };
  const saveSidebarLayout = (sizes) => {
    localGameState.ui.layout.split.sidebar = sizes;
    saveLayout();
  };

  // if you're trying to do UI design, see "uncomment me" in packages/server/src/RoomManager.ts
  // that way you don't have to constanttly create a new room

  return (
    <>
      <Sign />

      <Split
        direction="horizontal"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          transition: "height 0.25s ease-out",
        }}
        sizes={localGameState.ui.layout.split.game_sidebar}
        onDragEnd={saveGameSidebarLayout}
      >
        <Split
          direction="vertical"
          style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
          }}
          sizes={localGameState.ui.layout.split.game_blockbar}
          onDragEnd={saveGameBlockbarLayout}
        >
          <PlayWindow>{gameCanvas}</PlayWindow>

          <GrayFilled>
            <Split
              direction="horizontal"
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                transition: "height 0.25s ease-out",
              }}
              sizes={[25, 75]}
            >
              <div>
                <MobileControls />

                <WorldSettingsButton />
                <Suspense fallback={null}>
                  <GodModeButton />
                </Suspense>
                <SoundButton />
              </div>

              <BlockBarNew />
            </Split>
          </GrayFilled>
        </Split>
        <div>
          <Split
            direction="vertical"
            style={{ height: "100vh" }}
            sizes={localGameState.ui.layout.split.sidebar}
            onDragEnd={saveSidebarLayout}
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
              {/* thinking of a toolbar here for the minimap too the toolbar would have options like */}
              {/* reseting zoom/pan, popping it out, taking screenshots, etc */}
              <MinimapHerePlease />
              {/* maybe a second toolbar here for settings, go to lobby, etc, but might get a bit too */}
              {/* cluttered? might keep it in blockbar, we'll see */}
            </BlackFilled>
          </Split>
        </div>
      </Split>
    </>
  );
}
