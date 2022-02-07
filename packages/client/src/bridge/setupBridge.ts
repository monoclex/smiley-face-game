import { Authentication, Connection, Game, ZJoinRequest } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import makeClientConnectedGame from "../game/helpers/makeClientConnectedGame";
import textures from "../game/textures";
import state from "./state";
import Chat from "./Chat";
import { PlayerList } from "./PlayerList";
import GameRenderer from "./GameRenderer";
import { loopRequestAnimationFrame } from "./RegisterTickLoop";

interface Bridge {
  game: Game;
  connection: Connection;
  gameRenderer: GameRenderer;
  cleanup: () => void;
}

export default async function setupBridge(auth: Authentication, joinRequest: ZJoinRequest, renderer: Renderer): Promise<Bridge> {
  const connection = await auth.connect(joinRequest);

  await textures.load(connection.tileJson);

  const game = makeClientConnectedGame(renderer, connection);

  // connect game to `state` so react components can call methods on it
  state.game = game;
  state.connection = connection;

  // add game ui components
  const chat = new Chat(game, connection.init);
  const playerList = new PlayerList(game);
  const gameRenderer = new GameRenderer(game, renderer);

  // add ourselves
  const self = game.players.add({
    playerId: connection.init.playerId,
    packetId: "SERVER_PLAYER_JOIN",
    username: connection.init.username,
    role: connection.init.role,
    isGuest: connection.init.isGuest,
    joinLocation: connection.init.spawnPosition,
    hasGun: false,
    gunEquipped: false,
  });

  gameRenderer.focus = self;

  (async () => {
    for await (const message of connection) {
      game.handleEvent(message);
      chat.handleEvent(message);
      playerList.handleEvent(message);
    }
  })();

  loopRequestAnimationFrame((elapsed) => {
    if (!connection.connected) return "halt";
    game.update(elapsed);
    gameRenderer.draw();
  });

  state.gameRenderer = gameRenderer;

  return {
    game,
    connection,
    gameRenderer,
    cleanup: () => {
      if (connection.connected) {
        connection.close();
      }
    },
  };
}
