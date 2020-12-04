import type { ZSInit } from "@smiley-face-game/api/packets";
import type { Connection } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import type TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import Game from "../Game";
import Bullets from "../Bullets";
import Chat from "../Chat";
import ClientPlayers from "./ClientPlayers";
import ClientWorld from "./ClientWorld";
import ClientNetwork from "./ClientNetwork";
import ClientBullet from "./components/ClientBullet";
import AuthoredBlockPlacer from "./AuthoredBlockPlacer";
import ClientSelector from "./ClientSelector";
import ClientDisplay from "./ClientDisplay";
import ClientBlockBar from "./ClientBlockBar";
import Keyboard from "./Keyboard";

export default class ClientGame extends Game {
  readonly authoredBlockPlacer: AuthoredBlockPlacer;
  readonly blockBar: ClientBlockBar;
  readonly connection: Connection;
  readonly display: ClientDisplay;
  readonly keyboard: Keyboard;
  readonly network: ClientNetwork;
  readonly renderer: Renderer;
  readonly selector: ClientSelector;

  constructor(tileJson: TileRegistration, init: ZSInit, renderer: Renderer, connection: Connection) {
    const display = new ClientDisplay(renderer);
    const network = new ClientNetwork(connection);

    super(tileJson, init, () => [
      new Bullets(ClientBullet),
      new Chat(),
      new ClientPlayers(display.players),
      new ClientWorld(tileJson, init.size, display.worldBehind, display.worldInfront),
    ]);

    this.connection = connection;
    this.renderer = renderer;
    this.blockBar = new ClientBlockBar(connection.tileJson);
    this.display = display;
    this.keyboard = new Keyboard(this.self);
    this.network = network;
    this.authoredBlockPlacer = new AuthoredBlockPlacer(this.self, this.connection, this.world, this.blockBar);
    this.selector = new ClientSelector(this.display.root, this.authoredBlockPlacer, this.world);

    for (const playerInfo of connection.init.players) {
      this.players.addPlayer(playerInfo);
    }

    (async () => {
      for await (const message of connection) {
        this.handle(message);
      }
    })();
  }

  tick(deltaMs: number) {
    super.tick(deltaMs);

    this.selector.tick();
    this.display.draw(this);
    this.network.update(this);
  }
}
