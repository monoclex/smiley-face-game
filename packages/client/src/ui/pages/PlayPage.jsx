//@ts-check
import React, { Suspense, useEffect, useRef, useState } from "react";

import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import { useNavigate, useLocation, useMatch } from "react-router";
import { useAuth } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import useSuspenseForPromise from "../hooks/useSuspenseForPromise";
import { styled } from "@mui/material";
import useTeardown from "../hooks/useTeardown";
import { BigLoading } from "../components/FullscreenBackdropLoading";
import GameUI from "../game/GameUI";

let isPlaying = false;

// TODO: this is weird as a component, but it WORKS and im TIRED of touching this code
function ConnectToGame({ gameElement, size: { width, height } }) {
  isPlaying = true;
  useTeardown(() => (isPlaying = false), [], "playing the game");

  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch("/games/:id");

  const auth = useAuth();

  const { cleanup, renderer } = useSuspenseForPromise("gaming", async () => {
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

    // if we navigated away while loading, close the connection
    // it's possible that we could navigate back, and then navigate back to here
    // while we are still loading the other connection, but unlikely, so i won't deal with it
    // actually i think the `useSuspenseForPromise` would prevent that. or nah, on teardown
    // the cachce entry gets deleted so nvm
    if (!isPlaying) connection.close();
    else navigate(`/games/${connection.init.worldId}`, { replace: true });

    return { game, cleanup, renderer };
  });

  // run `cleanup` on component removal
  useTeardown(
    () => {
      renderer.destroy(false);
      cleanup();
    },
    [],
    "game cleanup"
  );

  renderer.resize(width, height);

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

  useEffect(() => {
    // forcibly coerce a known only `undefined` to `typeof current`
    /** @type {any} */
    const expr = divRef.current;
    /** @type {HTMLDivElement | undefined} */
    const current = expr;

    if (!current) throw new Error("cannot be undef");

    current.appendChild(gameElement);

    const listener = () => {
      gameElement.style.visibility = "hidden";
      gameElement.width = 0;
      gameElement.height = 0;
      requestAnimationFrame(() => {
        const size = { width: current.offsetWidth - 1, height: current.offsetHeight - 1 };
        gameElement.width = size.width;
        gameElement.height = size.height;
        gameElement.style.visibility = "visible";
        setSize(size);
      });
    };

    listener();

    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  return (
    <EntireDiv ref={divRef}>
      <Suspense fallback={<BigLoading />}>
        <ConnectToGame gameElement={gameElement} size={size} />
      </Suspense>
    </EntireDiv>
  );
}

export default function PlayPage() {
  return (
    <ErrorBoundary>
      <GameUI>
        <GameArea />
      </GameUI>
    </ErrorBoundary>
  );
}
