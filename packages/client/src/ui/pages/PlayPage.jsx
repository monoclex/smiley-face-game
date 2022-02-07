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

// TODO: this is weird as a component, but it WORKS and im TIRED of touching this code
function ConnectToGame({ gameElement, size: { width, height } }) {
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch("/games/:id");

  const auth = useAuth();

  const { game, cleanup, renderer } = useSuspenseForPromise("gaming", async () => {
    const renderer = new Renderer({
      width: gameElement.width,
      height: gameElement.height,
      view: gameElement,
      antialias: true,
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { game, connection, cleanup } = await setupBridge(auth, location.state ?? { type: "join", id: match.params.id }, renderer, () => {
      window.history.back();
    });

    navigate(`/games/${connection.init.worldId}`, { replace: true });

    return { game, cleanup, renderer };
  });

  // run `cleanup` on component removal
  useEffect(() => cleanup, [cleanup]);

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
  const [callback, setCallback] = useState(() => () => {
    // we give a factory to an empty callback
    // this is so we infer the type of `callback` correctly
  });

  // run `callback` on component teardown
  useTeardown(() => callback, [callback]);

  return (
    <ErrorBoundary callback={(recover) => setCallback(() => recover)}>
      <GameUI>
        <GameArea />
      </GameUI>
    </ErrorBoundary>
  );
}
