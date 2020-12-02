import { Container, Renderer } from "pixi.js";
import { Game, Bullets, Players, Chat, World, Bullet } from "./Game";
import { Connection } from "@smiley-face-game/api";

export class ClientBullet extends Bullet {}

export function makeClientConnectedGame(renderer: Renderer, connection: Connection): Game {
  const root = new Container();
  const bullets = new Container();
  const players = new Container();
  const worldBehind = new Container();
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

  return new Game(connection.tileJson, connection.init, (tileJson, init) => [
    new Bullets(),
    new Chat(),
    display,
    new Players(),
    new World(tileJson, init.size),
  ]);
}
