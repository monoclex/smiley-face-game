import Chat from "../Chat";
import Player from "../Player";

export default class ClientChat extends Chat {
  id: number = 0;

  add(time: Date, sender: Player, message: string) {
    super.add(time, sender, message);
  }

  ratelimitFor(durationMs: number) {
    super.ratelimitFor(durationMs);
  }
}
