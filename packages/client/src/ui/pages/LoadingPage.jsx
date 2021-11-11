//@ts-check
import React, { useEffect, useState } from "react";

import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import NewPlayPage from "./NewPlayPage";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { useAuth } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import useSuspenseForPromise from "../hooks/useSuspenseForPromise";

function LoadingPage() {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch("/games/:id");

  const auth = useAuth();

  const [gameElement] = useState(document.createElement("canvas"));
  // const [game, setGame] = useState(undefined);

  // don't show inspect on right click
  gameElement.oncontextmenu = () => false;

  const { game, cleanup } = useSuspenseForPromise("gaming", async () => {
    const renderer = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      view: gameElement,
      antialias: true,
    });

    // const completion = new PromiseCompletionSource();

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
  useEffect(() => () => cleanup(), [cleanup]);

  console.log("rendering game", game);
  return <NewPlayPage game={game} gameElement={gameElement} />;
}

export default function LoadingPageWrapper() {
  return (
    <ErrorBoundary>
      <LoadingPage />
    </ErrorBoundary>
  );
}
