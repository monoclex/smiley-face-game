//@ts-check
import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";

import setupBridge from "../../bridge/setupBridge";
import state from "../../bridge/state";
import { Renderer } from "pixi.js";
import NewPlayPage from "./NewPlayPage";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { useAuth } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import useSuspenseForPromise from "../hooks/useSuspenseForPromise";
import { styled } from "@mui/material";
import useTeardown from "../hooks/useTeardown";
import useResize from "../hooks/useResize";
import PlayPage from "./NewPlayPage";
import { BigLoading } from "../components/FullscreenBackdropLoading";

function LoadingPage({ gameElement, size: { width, height } }) {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch("/games/:id");

  const auth = useAuth();

  const { game, cleanup } = useSuspenseForPromise("gaming", async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    await sleep(1000);

    console.log("Renderer made");
    const renderer = new Renderer({
      width: gameElement.width,
      height: gameElement.height,
      view: gameElement,
      antialias: true,
    });

    console.warn("``` setupBridge ```!");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { game, cleanup } = await setupBridge(auth, location.state ?? { type: "join", id: match.params.id }, renderer, (game) => {
      if (game.running) {
        window.history.back();
      }
    });

    history.replace(`/games/${game.connection.init.worldId}`, undefined);

    return { game, cleanup };
  });

  // run `cleanup` on component removal
  useEffect(() => cleanup, [cleanup]);

  console.log("render game", width, height);
  game.renderer.resize(width, height);

  return null;
}

const EntireDiv = styled("div")({
  width: "100%",
  height: "100%",
  // TODO: why is this here?
  lineHeight: "1px",
});

function useForceUpdate() {
  const [dep, setTicks] = useState(0);

  const forceUpdate = React.useMemo(() => () => setTicks((ticks) => ticks + 1), []);
  return [dep, forceUpdate];
}

function GameArea() {
  const [onUpdate, forceUpdate] = useForceUpdate();

  const [gameElement] = useState(() => {
    const gameElement = document.createElement("canvas");
    gameElement.oncontextmenu = () => false; // don't show inspect on right click
    return gameElement;
  });

  console.log("GameArea called");

  const divRef = useRef();
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!divRef.current) throw new Error("cannot be undef");

    divRef.current.appendChild(gameElement);

    const listener = () => {
      console.log("listener called");
      gameElement.style.visibility = "hidden";
      gameElement.width = 0;
      gameElement.height = 0;
      requestAnimationFrame(() => {
        const size = { width: divRef.current.offsetWidth, height: divRef.current.offsetHeight };
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
        <LoadingPage gameElement={gameElement} size={size} />
      </Suspense>
    </EntireDiv>
  );
}

export default function LoadingPageWrapper() {
  const [callback, setCallback] = useState(() => () => {
    // we give a factory to an empty callback
    // this is so we infer the type of `callback` correctly
  });

  // run `callback` on component teardown
  useTeardown(() => callback, [callback]);

  return (
    <ErrorBoundary callback={(recover) => setCallback(() => recover)}>
      <PlayPage>
        <GameArea />
      </PlayPage>
    </ErrorBoundary>
  );
}
