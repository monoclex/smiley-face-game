import { Authentication, ZJoinRequest } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import ClientGame from "../game/client/ClientGame";
import makeClientConnectedGame from "../game/helpers/makeClientConnectedGame";
import textures from "../game/textures";

interface Bridge {
  game: ClientGame;
  cleanup: () => void;
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

  // eslint-disable-next-line no-undef
  let loop: FrameRequestCallback;
  let timeStart: number;

  loop = (elapsed) => {
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

  return {
    game,
    cleanup: () => {
      if (game.running) {
        game.cleanup();
      }
    },
  };
}
