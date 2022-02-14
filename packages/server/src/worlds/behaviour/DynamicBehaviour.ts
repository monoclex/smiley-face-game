import ensureValidates from "../../ensureValidates";
import Behaviour from "./Behavior";
import generateWorld from "../generateWorld";
import Connection from "../../worlds/Connection";
import type { ZJoinRequest } from "@smiley-face-game/api/ws-api";
import type { ZHeaps, ZWorldBlocks, ZWorldDetails } from "@smiley-face-game/api/types";
import { zJoinRequest } from "@smiley-face-game/api/ws-api";
import TileJson from "../TileJson";

export default class DynamicBehaviour implements Behaviour {
  #name: string;
  #width: number;
  #height: number;

  readonly id: string;

  constructor(
    joinRequest: Exclude<Extract<ZJoinRequest, { type: "create" }>, { id: string }>,
    id: string
  ) {
    ensureValidates(zJoinRequest, joinRequest);

    this.id = id;
    this.#name = joinRequest.name;
    this.#width = joinRequest.width;
    this.#height = joinRequest.height;
  }

  onPlayerJoin(connection: Connection) {
    connection.hasEdit = true;
    connection.canGod = false; // todo: make users able to configure this on world create
  }

  loadDetails(): Promise<ZWorldDetails> {
    return Promise.resolve({
      name: this.#name,
      width: this.#width,
      height: this.#height,
      owner: undefined,
      ownerId: undefined,
    });
  }

  saveDetails(details: ZWorldDetails): Promise<void> {
    if (this.#width !== details.width) throw new Error("Can't change world size.");
    if (this.#height !== details.height) throw new Error("Can't change world size.");

    this.#name = details.name;

    return Promise.resolve();
  }

  loadBlocks(): Promise<[ZWorldBlocks, ZHeaps]> {
    return Promise.resolve([JSON.parse(generateWorld(this.#width, this.#height, TileJson)), []]);
  }

  saveBlocks(): Promise<void> {
    return Promise.resolve();
  }
}
