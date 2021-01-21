import Player from "./components/Player";
import Message from "./interfaces/Message";

export default class Chat {
  private _atTimeCanSend: Date = new Date();
  private readonly _messages: Message[] = [];
  private _topId: number = 0;

  get messages(): Iterable<Message> {
    return this._messages;
  }

  get topId(): number {
    return this._topId;
  }

  add(time: Date, sender: Player, message: string) {
    this._messages.push({ id: this._topId++, time, sender, content: message });
  }

  ratelimitFor(durationMs: number) {
    this._atTimeCanSend = new Date();
    this._atTimeCanSend.setTime(this._atTimeCanSend.getTime() + durationMs);
  }
}
