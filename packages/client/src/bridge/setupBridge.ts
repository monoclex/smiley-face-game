import { Authentication, ZJoinRequest } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import ClientGame from "../game/client/ClientGame";
import makeClientConnectedGame from "../game/helpers/makeClientConnectedGame";
import StateSystem from "../game/StateSystem";
import textures from "../game/textures";
import { gameGlobal } from "../state";
import state from "./state";

interface Bridge {
  game: ClientGame;
  cleanup: () => void;
}

function connectToRecoil(stateSystem: StateSystem) {
  stateSystem.onStateDifference = (state) => gameGlobal.set(state);
}

export default async function setupBridge(
  token: string,
  joinRequest: ZJoinRequest,
  renderer: Renderer,
  shutdown: (game: ClientGame) => void
): Promise<Bridge> {
  const connection = await new Authentication(token).connect(joinRequest);

  await textures.load(connection.tileJson);

  const game = makeClientConnectedGame(renderer, connection);

  (async () => {
    for await (const message of connection) {
      game.handle(message);
    }

    if (game.running) {
      shutdown(game);
    }
  })();

  connectToRecoil(game.stateSystem);

  let timeStart: number;

  // eslint-disable-next-line no-undef
  const loop: FrameRequestCallback = (elapsed) => {
    if (!game.running) return;

    const delta = elapsed - timeStart;
    game.tick(delta);
    timeStart = elapsed;

    requestAnimationFrame(loop);
  };

  requestAnimationFrame((elapsed) => {
    timeStart = elapsed;
    game.tick(0);
    requestAnimationFrame(loop);
  });

  // connect game to `state` so react components can call methods on it
  state.game = game;

  return {
    game,
    cleanup: () => {
      if (game.running) {
        game.cleanup();
      }
    },
  };
}
