//@ts-check
import React, { useEffect, useState } from "react";
import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import PromiseCompletionSource from "../../PromiseCompletionSource";
import NewPlayPage from "./NewPlayPage";
import { useHistory } from "react-router";
import { useAuth } from "../hooks";

export default function LoadingPage({
  location: { state },
  match: {
    params: { id },
  },
}) {
  const history = useHistory();
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

    setupBridge(auth, state ?? { type: "join", id }, renderer, (game) => {
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
    return <h1>loadingeroooooooooo</h1>;
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
