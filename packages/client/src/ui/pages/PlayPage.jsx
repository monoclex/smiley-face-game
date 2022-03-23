//@ts-check
import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";

import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import { useNavigate, useLocation, useMatch } from "react-router";
import { useAuth } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import useSuspenseForPromise from "../hooks/useSuspenseForPromise";
import { Button, styled, Typography } from "@mui/material";
import useTeardown from "../hooks/useTeardown";
import FullscreenBackdropLoading, { BigLoading } from "../components/FullscreenBackdropLoading";
import GameUI from "../game/GameUI";
import { loopRequestAnimationFrame } from "../../bridge/RegisterTickLoop";
import { playJoin } from "../../bridge/PlayerJoinLeaveSoundEffects";
import state from "../../bridge/state";
import ConnectionError from "@smiley-face-game/api/net/ConnectionError";
import CreateRoomDialog from "../components/CreateRoomDialog";

let isPlaying = false;
let renderedOnce = false;

// TODO: this is weird as a component, but it WORKS and im TIRED of touching this code
function ConnectToGame({ gameElement, size: { width, height } }) {
  isPlaying = true;
  useTeardown(() => ((isPlaying = false), (renderedOnce = false)), [], "playing the game");

  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch("/games/:id");

  const auth = useAuth();

  const { cleanup, renderer, connection } = useSuspenseForPromise("gaming", async () => {
    const renderer = new Renderer({
      width: gameElement.width,
      height: gameElement.height,
      view: gameElement,
      antialias: true,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { game, connection, cleanup } = await setupBridge(
      gameElement,
      auth,
      location.state ?? { type: "join", id: match.params.id },
      renderer
    );

    return { game, cleanup, renderer, connection };
  });

  // if we navigated away while loading, close the connection
  // it's possible that we could navigate back, and then navigate back to here
  // while we are still loading the other connection, but unlikely, so i won't deal with it
  // actually i think the `useSuspenseForPromise` would prevent that. or nah, on teardown
  // the cachce entry gets deleted so nvm
  if (!isPlaying) connection.close();
  else useEffect(() => navigate(`/games/${connection.init.worldId}`, { replace: true }), []);

  // run `cleanup` on component removal
  useTeardown(
    () => {
      renderer.destroy(false);
      cleanup();
    },
    [],
    "game cleanup"
  );

  useLayoutEffect(() => {
    if (!renderedOnce) {
      playJoin();
    }

    renderedOnce = true;
  }, []);

  return null;
}

const EntireDiv = styled("div")({
  width: "100%",
  height: "100%",
  // TODO: why is this here?
  lineHeight: "1px",
});

function GameArea() {
  const [gameElement] = useState(() => {
    const gameElement = document.createElement("canvas");
    gameElement.oncontextmenu = () => false; // don't show inspect on right click
    return gameElement;
  });

  const divRef = useRef();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const updateSize = () => {
    // forcibly coerce a known only `undefined` to `typeof current`
    /** @type {any} */
    const expr = divRef.current;
    /** @type {HTMLDivElement | undefined} */
    const current = expr;
    if (!current) return;

    gameElement.style.visibility = "hidden";
    gameElement.width = 0;
    gameElement.height = 0;
    requestAnimationFrame(() => {
      const size = { width: current.offsetWidth - 1, height: current.offsetHeight - 1 };
      gameElement.width = size.width;
      gameElement.height = size.height;
      gameElement.style.visibility = "visible";
      if (state.gameRenderer) state.gameRenderer.renderer.resize(size.width, size.height);
      setSize(size);
    });
  };

  useEffect(() => {
    // forcibly coerce a known only `undefined` to `typeof current`
    /** @type {any} */
    const expr = divRef.current;
    /** @type {HTMLDivElement | undefined} */
    const current = expr;
    if (!current) return;

    current.appendChild(gameElement);

    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    // when we're loading the world, the block bar isn't loaded
    // once the game loads, then the block bar loads, and it takes
    // up some space. once it takes up space, the screen overflows
    // because the game is set at a fixed height
    //
    // https://stackoverflow.com/questions/14866775/detect-document-height-change
    // here we detect any changes in height, and then re-set our height
    let heightOld = document.body.scrollHeight;
    loopRequestAnimationFrame(() => {
      let heightNow = document.body.scrollHeight;

      if (heightOld != heightNow) {
        updateSize();
        heightOld = heightNow;
      }
    });
  }, []);

  return (
    <EntireDiv ref={divRef}>
      <ConnectToGame gameElement={gameElement} size={size} />
    </EntireDiv>
  );
}

export default function PlayPage() {
  return (
    <ErrorBoundary render={FriendlyErrorMessage}>
      <GameUI>
        <GameArea />
      </GameUI>
    </ErrorBoundary>
  );
}

function FriendlyErrorMessage({ error, callback }) {
  const navigate = useNavigate();
  const match = useMatch("/games/:id");

  useEffect(
    () =>
      navigate("/lobby", {
        state: {
          error,
          name: error.name,
          id: match?.params.id,
        },
      }),
    []
  );

  return null;
}
