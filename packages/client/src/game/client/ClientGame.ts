import type { ZSInit } from "@smiley-face-game/api/packets";
import type { Connection } from "@smiley-face-game/api";
import type { Renderer } from "pixi.js";
import type TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import Game from "../Game";
import ClientPlayers from "./ClientPlayers";
import ClientWorld from "./ClientWorld";
import ClientNetwork from "./ClientNetwork";
import AuthoredBlockPlacer from "./AuthoredBlockPlacer";
import ClientSelector from "./ClientSelector";
import ClientDisplay from "./ClientDisplay";
import ClientBlockBar from "./ClientBlockBar";
import Keyboard from "./Keyboard";
import type ClientPlayer from "./ClientPlayer";
import { TileLayer } from "@smiley-face-game/api/types";
import ClientAim from "./ClientAim";
import ClientBullets from "./ClientBullets";
import ClientChat from "./ClientChat";

export default class ClientGame extends Game {
  readonly aim: ClientAim;
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

    super(tileJson, init, (timer) => [
      new ClientBullets(timer, display.bullets),
      new ClientChat(),
      new ClientPlayers(display.players),
      new ClientWorld(tileJson, init.size, display.worldBehind, display.worldInfront),
    ]);

    const self = this.self as ClientPlayer;

    this.connection = connection;
    this.renderer = renderer;
    this.blockBar = new ClientBlockBar(connection.tileJson);
    this.display = display;
    this.aim = new ClientAim(this.display.root, self, this.bullets);
    this.keyboard = new Keyboard(self);
    this.network = network;
    this.authoredBlockPlacer = new AuthoredBlockPlacer(self, this.connection, this.world, this.blockBar);
    this.selector = new ClientSelector(this.display.root, this.authoredBlockPlacer, this.world);

    self.onEnterGun = (x, y) => {
      if (!self.probablyHasGun) {
        const position = { x, y };

        this.connection.pickupGun(position);
        self.setProbablyGunPickupLocation(position);
      }
    };

    self.onGunStateChange = (previous, current) => {
      // `onEnterGun` handles this
      if (previous === "none") return;

      if (current === "none") {
        // currently no way to implement this
        return;
      }

      this.connection.equipGun(current === "held");
    };

    this.aim.onShoot = (angle) => {
      this.connection.fireBullet(angle);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.world.onPlace = (layer, x, y, id) => {
      if (!self.pendingGunPickup) return;
      if (layer !== TileLayer.Action) return;
      if (self.probablyPickedUpGunAt === undefined) throw new Error("impossible");
      if (x !== self.probablyPickedUpGunAt.x || y !== self.probablyPickedUpGunAt.y) return;

      // a modification to the tile we picked the gun up on most likely means failure
      self.setProbablyGunPickupLocation(undefined);
    };

    for (const playerInfo of connection.init.players) {
      this.players.addPlayer(playerInfo);
    }
  }

  tick(deltaMs: number) {
    super.tick(deltaMs);

    this.selector.enable(!this.self.isGunHeld);
    this.selector.tick();

    this.display.draw(this);
    this.network.update(this);

    // tick the aim *after* this tick so that it gives it a kinda "bouncy" effect (does this work?)
    this.aim.tick();
  }

  cleanup() {
    this.aim.cleanup();
    this.connection.close();
    super.cleanup();
  }
}
