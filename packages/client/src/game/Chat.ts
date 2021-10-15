import Player from "./Player";
import Message from "./interfaces/Message";

export default class Chat {
  private _atTimeCanSend: Date = new Date();
  readonly messages: Message[] = [];
  private _topId = 0;

  get topId(): number {
    return this._topId;
  }

  add(time: Date, sender: Player, message: string) {
    this.messages.push({ id: this._topId++, time, sender, content: message });
  }

  ratelimitFor(durationMs: number) {
    this._atTimeCanSend = new Date();
    this._atTimeCanSend.setTime(this._atTimeCanSend.getTime() + durationMs);
  }
}
