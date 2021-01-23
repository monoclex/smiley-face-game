import { Connection } from "@smiley-face-game/api";
import { Renderer } from "pixi.js";
import ClientGame from "../client/ClientGame";

export default function makeClientConnectedGame(renderer: Renderer, connection: Connection): ClientGame {
  const game = new ClientGame(connection.tileJson, connection.init, renderer, connection);
  return game;
}
