//@ts-check
import React, { Suspense, useEffect, useLayoutEffect, useState } from "react";

import setupBridge from "../../bridge/setupBridge";
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

const GameContainer = styled("div")({
  lineHeight: "1px",
});

function LoadingPage({ gameElement }) {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch("/games/:id");

  const auth = useAuth();

  const { game, cleanup } = useSuspenseForPromise("gaming", async () => {
    console.log("Renderer made");
    const renderer = new Renderer({
      width: gameElement.width,
      height: gameElement.height,
      view: gameElement,
      antialias: true,
    });

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

  return null;
}

// function

export default function LoadingPageWrapper() {
  const [callback, setCallback] = useState(() => () => {
    // we give a factory to an empty callback
    // this is so we infer the type of `callback` correctly
  });

  // run `callback` on component teardown
  useTeardown(() => callback, [callback]);

  const [gameElement] = useState(() => {
    const gameElement = document.createElement("canvas");
    gameElement.oncontextmenu = () => false; // don't show inspect on right click
    return gameElement;
  });

  return (
    <ErrorBoundary callback={(recover) => setCallback(() => recover)}>
      <PlayPage>
        <GameContainer ref={(elem) => elem && elem.appendChild(gameElement)} />
        <LoadingPage gameElement={gameElement} />
      </PlayPage>
    </ErrorBoundary>
  );
}
