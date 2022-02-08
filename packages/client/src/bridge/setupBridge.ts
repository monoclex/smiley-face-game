import { Authentication, Connection, Game, ZJoinRequest } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import makeClientConnectedGame from "../game/helpers/makeClientConnectedGame";
import textures from "./textures";
import state from "./state";
import Chat from "./Chat";
import { PlayerList } from "./PlayerList";
import GameRenderer from "./rendering/GameRenderer";
import { loopRequestAnimationFrame } from "./RegisterTickLoop";
import Keyboard from "./Keyboard";
import MouseInteraction from "./MouseInteraction";
import AuthoredBlockPlacer from "./AuthoredBlockPlacer";
import ClientBlockBar from "./ClientBlockBar";
import { gameGlobal } from "../state";

interface Bridge {
  game: Game;
  connection: Connection;
  gameRenderer: GameRenderer;
  cleanup: () => void;
}

export default async function setupBridge(auth: Authentication, joinRequest: ZJoinRequest, renderer: Renderer): Promise<Bridge> {
  const connection = await auth.connect(joinRequest);

  // TODO: the block bar should primarily resisde within the react component,
  // we shouldn't own it
  const blockBar = new ClientBlockBar(connection.tileJson);
  state.blockBar = blockBar;

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
  // TODO: we need to update gameGlobal whenever `self` roles/etc gets updated
  gameGlobal.modify({ self: self.cheap() });

  const keyboard = new Keyboard(self, connection);

  const mouseInteraction = new MouseInteraction(gameRenderer.root, new AuthoredBlockPlacer(self, connection, game, blockBar), game);
  gameRenderer.events.on("draw", () => mouseInteraction.draw());
  gameRenderer.root.addChild(mouseInteraction.selection);

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
  state.keyboard = keyboard;

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
