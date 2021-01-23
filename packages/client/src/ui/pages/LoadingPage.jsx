import React, { useEffect, useState } from "react";
import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import PromiseCompletionSource from "../../PromiseCompletionSource";
import NewPlayPage from "./NewPlayPage";

/**
 * @returns {import("@smiley-face-game/api/ws-api").ZJoinRequest}
 */
function inferJoinRequest(roomId) {
  return { id: roomId, type: "saved" };
  // if (!state || !state.request) {
  //   // if the user navigates here naturally, we have to infer the state
  //   const { type } = qs.parse(search);
  //   return { request: "join", roomId, type: type ?? "saved" };
  // }
  // return state;
}

export default function LoadingPage({
  token,
  // location: { search, state },
  match: {
    params: { roomId },
  },
}) {
  const [gameElement, _] = useState(document.createElement("canvas"));
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

    setupBridge(token, inferJoinRequest(roomId), renderer, (game) => {
      if (game.running) {
        window.history.back();
      }
    })
      .then(({ game, cleanup }) => {
        completion.resolve(cleanup);
        setGame(game);
      })
      .catch((error) => {
        completion.resolve(() => {});
        setGame(error);
      });

    return () => {
      completion.handle.then((cleanup) => cleanup());
    };
  }, [token, roomId]);

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
