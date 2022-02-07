import { Authentication, Connection, Game, ZJoinRequest } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import makeClientConnectedGame from "../game/helpers/makeClientConnectedGame";
import textures from "../game/textures";
import state from "./state";
import Chat from "./Chat";
import { PlayerList } from "./PlayerList";

interface Bridge {
  game: Game;
  connection: Connection;
  cleanup: () => void;
}

export default async function setupBridge(
  auth: Authentication,
  joinRequest: ZJoinRequest,
  renderer: Renderer,
  shutdown: (game: Game) => void
): Promise<Bridge> {
  const connection = await auth.connect(joinRequest);

  await textures.load(connection.tileJson);

  const game = makeClientConnectedGame(renderer, connection);

  // connect game to `state` so react components can call methods on it
  state.game = game;
  state.connection = connection;

  // add ourselves
  const _self = game.players.add({
    playerId: connection.init.playerId,
    packetId: "SERVER_PLAYER_JOIN",
    username: connection.init.username,
    role: connection.init.role,
    isGuest: connection.init.isGuest,
    joinLocation: connection.init.spawnPosition,
    hasGun: false,
    gunEquipped: false,
  });

  // add game ui components
  const chat = new Chat(game, connection.init);
  const playerList = new PlayerList(game);

  (async () => {
    for await (const message of connection) {
      game.handleEvent(message);
      chat.handleEvent(message);
      playerList.handleEvent(message);
    }

    shutdown(game);
  })();

  let timeStart: number = new Date().getDate();

  // eslint-disable-next-line no-undef
  const loop: FrameRequestCallback = (elapsed) => {
    if (!connection.connected) return;

    const delta = elapsed - timeStart;
    game.update(delta);
    timeStart = elapsed;

    requestAnimationFrame(loop);
  };

  requestAnimationFrame((elapsed) => {
    timeStart = elapsed;
    game.update(0);
    requestAnimationFrame(loop);
  });

  return {
    game,
    connection,
    cleanup: () => {
      if (connection.connected) {
        connection.close();
      }
    },
  };
}
