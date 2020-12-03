import { ZSPlayerJoin } from "@smiley-face-game/api/packets";
import { Container } from "pixi.js";
import Players from "./Players";
import { playerList } from "../recoil/atoms/playerList";
import ClientPlayer from "./ClientPlayer";

export default class ClientPlayers extends Players {
  constructor(readonly players: Container) {
    super(ClientPlayer);
  }

  addPlayer(joinInfo: ZSPlayerJoin): ClientPlayer {
    const player = super.addPlayer(joinInfo) as ClientPlayer;
    this.players.addChildAt(player.sprite, 0);
    playerList.modify({
      players: [
        ...playerList.state.players,
        {
          playerId: player.id,
          role: player.role,
          username: player.username,
        },
      ],
    });
    return player;
  }

  removePlayer(id: number): ClientPlayer {
    const player = super.removePlayer(id) as ClientPlayer;
    this.players.removeChild(player.sprite);
    return player;
  }
}
