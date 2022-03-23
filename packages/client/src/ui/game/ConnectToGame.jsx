//@ts-check
import { useEffect, useLayoutEffect } from "react";

import setupBridge from "../../bridge/setupBridge";
import { Renderer } from "pixi.js";
import { useNavigate, useLocation, useMatch } from "react-router";
import { useAuth } from "../hooks";
import useSuspenseForPromise from "../hooks/useSuspenseForPromise";
import useTeardown from "../hooks/useTeardown";
import { playJoin } from "../../bridge/PlayerJoinLeaveSoundEffects";

let isPlaying = false;
let renderedOnce = false;

// TODO: this is weird as a component, but it WORKS and im TIRED of touching this code
export default function ConnectToGame({ gameElement, size: { width, height } }) {
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
