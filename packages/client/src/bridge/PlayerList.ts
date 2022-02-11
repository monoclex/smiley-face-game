import { Game, ZSPacket } from "@smiley-face-game/api";
import { gameGlobal } from "../state";

export class PlayerList {
  constructor(readonly game: Game) {
    this.updatePlayerList();
    this.game.players.events.on("add", this.updatePlayerList.bind(this));
    this.game.players.events.on("remove", this.updatePlayerList.bind(this));
  }

  handleEvent(event: ZSPacket) {
    switch (event.packetId) {
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
