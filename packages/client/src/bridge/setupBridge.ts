import { Authentication, Connection, Game, ZJoinRequest } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import textures from "./textures";
import state, { waitPromise } from "./state";
import Chat from "./Chat";
import { PlayerList } from "./PlayerList";
import GameRenderer from "./rendering/GameRenderer";
import { loopRequestAnimationFrame } from "./RegisterTickLoop";
import Keyboard from "./Keyboard";
import MouseInteraction from "./MouseInteraction";
import AuthoredBlockPlacer from "./AuthoredBlockPlacer";
import ClientBlockBar from "./ClientBlockBar";
import { gameGlobal } from "../state";
import PromiseCompletionSource from "../PromiseCompletionSource";
import { playLeave, registerPlayerJoinNLeaveSoundEffects } from "./PlayerJoinLeaveSoundEffects";

interface Bridge {
  game: Game;
  connection: Connection;
  gameRenderer: GameRenderer;
  cleanup: () => void;
}

// TODO: introduce a system that makes it more explicit the needed order of things
// right now there's an implicit order as per it being sequential,
// but in reality only a few things need to happen in a specific order, and it's
// generally more of a "after this, make sure to do that" sorta deal.

export default async function setupBridge(
  gameElement: HTMLElement,
  auth: Authentication,
  joinRequest: ZJoinRequest,
  renderer: Renderer
): Promise<Bridge> {
  const connection = await auth.connect(joinRequest);

  // TODO: the block bar should primarily resisde within the react component,
  // we shouldn't own it
  const blockBar = new ClientBlockBar(connection.tileJson);
  state.blockBar = blockBar;

  await textures.load(connection.tileJson);

  const game = new Game(connection.tileJson, connection.init);

  // connect game to `state` so react components can call methods on it
  //@ts-expect-error too lazy to have typedefs lol
  globalThis["state"] = state;
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
    canGod: connection.init.canGod,
    inGod: false,
  });

  playerList.self = self;
  state.self = self;

  game.physics.events.on("keyTouch", (kind, player) => {
    if (player === self) {
      connection.touchKey(kind);
    }
  });

  game.physics.events.on("playerKeyState", (key, player) => {
    if (player === self) {
      // needed so that when the player walks out of a blob of keys,
      // the keys will turn back to doors/gates
      gameRenderer.worldRenderer.flagDirty();
    }
  });

  gameRenderer.focus = self;
  // TODO: we need to update gameGlobal whenever `self` roles/etc gets updated
  gameGlobal.modify({ self: self.cheap() });

  const keyboard = new Keyboard(self, connection);

  const mouseInteraction = new MouseInteraction(
    gameRenderer.root,
    new AuthoredBlockPlacer(self, connection, game, blockBar),
    game,
    self,
    gameElement
  );
  gameRenderer.events.on("draw", () => mouseInteraction.draw());
  gameRenderer.root.addChild(mouseInteraction.selection);

  (async () => {
    for await (const message of connection) {
      game.handleEvent(message);
      chat.handleEvent(message);
      playerList.handleEvent(message);
    }

    // connection died, cleanup
    waitPromise.it = new PromiseCompletionSource();
    state.wait = waitPromise.it.handle;

    await playLeave();
  })();

  loopRequestAnimationFrame((elapsed) => {
    if (!connection.connected) return "halt";
    game.update(elapsed);
    gameRenderer.draw();
  });

  state.gameRenderer = gameRenderer;
  state.keyboard = keyboard;

  waitPromise.it.resolve({
    game,
    connection,
    gameRenderer,
    keyboard,
    blockBar,
    self,
  });

  registerPlayerJoinNLeaveSoundEffects(game);

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
