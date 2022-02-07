import { Connection, Game } from "@smiley-face-game/api";
import { Renderer } from "pixi.js";

export default function makeClientConnectedGame(renderer: Renderer, connection: Connection): Game {
  const game = new Game(connection.tileJson, connection.init);
  return game;
}
