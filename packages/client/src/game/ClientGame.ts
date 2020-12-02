import type { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import type { Connection } from "@smiley-face-game/api";
import { Container, Sprite, Renderer, Texture } from "pixi.js";
import { Game, Bullets, Players, Chat, World, Bullet, Player } from "./Game";
import playerUrl from "../assets/base.png";
import bulletUrl from "../assets/bullet.png";

export const textures = new (class {
  private _bullet: Texture | undefined;
  get bullet(): Texture {
    if (!this._bullet) throw new Error("`bullet` texture not loaded");
    return this._bullet;
  }

  private _player: Texture | undefined;
  get player(): Texture {
    if (!this._player) throw new Error("`player` texture not loaded");
    return this._player;
  }

  load(): Promise<void> {
    return Promise.all([playerUrl, bulletUrl])
      .then((urls) => Promise.all(urls.map(Texture.fromURL)))
      .then(([player, bullet]) => {
        this._player = player;
        this._bullet = bullet;
      });
  }
})();

export class ClientBullet extends Bullet {
  sprite: Sprite;

  constructor(x: number, y: number, angle: number) {
    super(x, y, angle);
    this.sprite = new Sprite(textures.bullet);
  }

  tick() {
    super.tick();
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
  }
}

export class ClientPlayer extends Player {
  sprite: Sprite;

  constructor(username: string, isGuest: boolean) {
    super(username, isGuest);
    this.sprite = new Sprite(textures.player);
  }

  tick() {
    super.tick();
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
  }
}

export class ClientPlayers extends Players {
  constructor(readonly players: Container) {
    super(ClientPlayer);
  }

  addPlayer(joinInfo: ZSPlayerJoin): ClientPlayer {
    const player = super.addPlayer(joinInfo) as ClientPlayer;
    this.players.addChild(player.sprite);
    return player;
  }

  removePlayer(id: number): ClientPlayer {
    const player = super.removePlayer(id) as ClientPlayer;
    this.players.removeChild(player.sprite);
    return player;
  }
}

export function makeClientConnectedGame(renderer: Renderer, connection: Connection): Game {
  const root = new Container();
  const worldBehind = new Container();
  const players = new Container();
  const bullets = new Container();
  const worldInfront = new Container();
  root.addChild(worldBehind); // <-- most behind
  root.addChild(players);
  root.addChild(bullets);
  root.addChild(worldInfront); // <-- closest to viewer

  const display = {
    draw: () => {
      renderer.render(root);
    },
  };

  const game = new Game(connection.tileJson, connection.init, (tileJson, init) => [
    new Bullets(ClientBullet),
    new Chat(),
    display,
    new ClientPlayers(players),
    new World(tileJson, init.size),
  ]);

  for (const playerInfo of connection.init.players) {
    game.players.addPlayer(playerInfo);
  }

  messagesTask();
  async function messagesTask() {
    for await (const message of connection) {
      game.handle(message);
    }
  }

  return game;
}
