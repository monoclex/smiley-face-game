import { Connection } from "@smiley-face-game/api";
import { Renderer } from "pixi.js";
import { loading } from "../recoil/atoms/loading";
import ClientGame from "./ClientGame";

export default function makeClientConnectedGame(renderer: Renderer, connection: Connection): ClientGame {
  //@ts-ignore
  window.HACK_FIX_LATER_selfId = connection.init.playerId;

  const game = new ClientGame(connection.tileJson, connection.init, renderer, connection);

  loading.set({ failed: false });

  return game;
}
