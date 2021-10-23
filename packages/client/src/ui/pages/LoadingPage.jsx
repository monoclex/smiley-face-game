//@ts-check
import React, { useEffect, useState } from "react";

import FullscreenBackdropLoading from "../components/FullscreenBackdropLoading";
import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import PromiseCompletionSource from "../../PromiseCompletionSource";
import NewPlayPage from "./NewPlayPage";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { useAuth } from "../hooks";

export default function LoadingPage() {
  const history = useHistory();
  const location = useLocation();
  const match = useRouteMatch("/games/:id");
  const auth = useAuth();

  const [gameElement] = useState(document.createElement("canvas"));
  const [game, setGame] = useState(undefined);

  // don't show inspect on right click
  gameElement.oncontextmenu = () => false;

  useEffect(() => {
    const renderer = new Renderer({
      width: window.innerWidth,
      height: window.innerHeight,
      view: gameElement,
      antialias: true,
    });

    const completion = new PromiseCompletionSource();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setupBridge(auth, location.state ?? { type: "join", id: match.params.id }, renderer, (game) => {
      if (game.running) {
        window.history.back();
      }
    })
      .then(({ game, cleanup }) => {
        completion.resolve(cleanup);
        setGame(game);
        history.push(`/games/${game.connection.init.worldId}`, undefined);
      })
      .catch((error) => {
        completion.resolve(() => {
          // what we resolve the completion with must be callable
        });
        setGame(error);
      });

    return () => {
      completion.handle.then((cleanup) => cleanup());
    };
  }, []);

  if (game === undefined) {
    return <FullscreenBackdropLoading />;
  } else if (game instanceof Error) {
    console.error(game);
    return (
      <>
        <h1>errrooooooooooooo</h1>
        {game.toString()} at <code>{game.stack}</code>
      </>
    );
  } else {
    return <NewPlayPage game={game} gameElement={gameElement} />;
  }
}
