import Player from "./components/Player";
import Message from "./interfaces/Message";

/**
 * A type that represents the `sender` in a Message, without holding a strong reference to the `Player`.
 * Old username/role data is cached in case the source object gets GC'd.
 */
class WeakPlayer {
  readonly player: WeakRef<Player>;
  private _username: Player["username"];
  private _role: Player["role"];

  constructor(player: Player) {
    this.player = new WeakRef(player);
    this._username = player.username;
    this._role = player.role;
  }

  get username(): Player["username"] {
    return (this._username = this.player.deref()?.username ?? this._username);
  }

  get role(): Player["role"] {
    return (this._role = this.player.deref()?.role ?? this._role);
  }
}

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
    this._messages.push({ id: this._topId++, time, sender: new WeakPlayer(sender), content: message });
  }

  ratelimitFor(durationMs: number) {
    this._atTimeCanSend = new Date();
    this._atTimeCanSend.setTime(this._atTimeCanSend.getTime() + durationMs);
  }
}
