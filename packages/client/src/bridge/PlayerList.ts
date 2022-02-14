import { Game, ZSPacket } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { gameGlobal } from "../state";

export class PlayerList {
  self?: Player;

  constructor(readonly game: Game) {
    this.updatePlayerList();

    const update = this.updatePlayerList.bind(this);
    this.game.players.events.on("add", update);
    this.game.players.events.on("remove", update);
    this.game.players.events.on("roleUpdate", update);
    this.game.players.events.on("updateCanGod", update);
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
      self: this.self?.cheap(),
    });
  }
}
