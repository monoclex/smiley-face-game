import { Game, ZSPacket } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { gameEventEmitter } from "./Events";

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

        if (event.playerId === this.self?.id) {
          this.updateSelf();
        }
        break;
      default:
        break;
    }
  }

  updatePlayerList() {
    gameEventEmitter.emit("onPlayerListUpdate", this.game);
  }

  updateSelf() {
    gameEventEmitter.emit("onSelfUpdated");
  }
}
