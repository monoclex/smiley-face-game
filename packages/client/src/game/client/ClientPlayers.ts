import { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import { Container } from "pixi.js";
import Players from "../Players";
import ClientPlayer from "./ClientPlayer";

export default class ClientPlayers extends Players {
  constructor(readonly players: Container) {
    super(ClientPlayer);
  }

  addPlayer(joinInfo: ZSPlayerJoin): ClientPlayer {
    const player = super.addPlayer(joinInfo) as ClientPlayer;
    this.players.addChildAt(player.container, 0);
    return player;
  }

  removePlayer(id: number): ClientPlayer {
    const player = super.removePlayer(id) as ClientPlayer;
    return player;
  }

  // cleanup() {}
}
