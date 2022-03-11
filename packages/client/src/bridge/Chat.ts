import { Game } from "@smiley-face-game/api";
import type { ZSChat, ZSInit, ZSPacket } from "@smiley-face-game/api/packets";
import Message from "../state/Message";
import { gameEventEmitter } from "./Events";

export default class Chat {
  private _atTimeCanSend: Date = new Date();
  readonly messages: Message[] = [];
  private _topId = 0;

  get topId(): number {
    return this._topId;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(readonly game: Game, _init: ZSInit) {
    // TODO: add chat messages from `init` to `messages`
  }

  ratelimitFor(durationMs: number) {
    this._atTimeCanSend = new Date();
    this._atTimeCanSend.setTime(this._atTimeCanSend.getTime() + durationMs);
  }

  handleEvent(event: ZSPacket) {
    if (event.packetId === "SERVER_CHAT") this.handleChat(event);
  }

  handleChat(event: ZSChat) {
    gameEventEmitter.emit("onMessageSent", event);
  }
}
