import { Game, ZSPacket } from "@smiley-face-game/api";
import { gameGlobal } from "../state";

export class PlayerList {
  constructor(readonly game: Game) {
    this.updatePlayerList();
  }

  handleEvent(event: ZSPacket) {
    switch (event.packetId) {
      case "SERVER_PLAYER_JOIN":
      case "SERVER_PLAYER_LEAVE":
      case "SERVER_ROLE_UPDATE":
        this.updatePlayerList();
        break;
      default:
        break;
    }
  }

  updatePlayerList() {
    gameGlobal.modify({
      players: this.game.players.list.map((x) => x.cheap()),
    });
  }
}
