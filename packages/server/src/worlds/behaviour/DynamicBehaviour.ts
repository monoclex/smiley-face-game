import {
  WorldJoinRequest,
  validateWorldJoinRequest,
} from "@smiley-face-game/schemas/web/game/ws/WorldJoinRequest";
import { WorldDetails } from "@smiley-face-game/schemas/WorldDetails";
import WorldBlocks from "../../worlds/WorldBlocks";
import ensureValidates from "../../ensureValidates";
import Behaviour from "./Behavior";
import generateWorld from "../generateWorld";
import Connection from "../../worlds/Connection";

export default class DynamicBehaviour implements Behaviour {
  #name: string;
  #width: number;
  #height: number;

  readonly id: string;

  constructor(
    joinRequest: Exclude<
      Extract<WorldJoinRequest, { type: "dynamic" }>,
      { id: string }
    >,
    id: string
  ) {
    ensureValidates(validateWorldJoinRequest, joinRequest);

    this.id = id;
    this.#name = joinRequest.name;
    this.#width = joinRequest.width;
    this.#height = joinRequest.height;
  }

  onPlayerJoin(connection: Connection) {
    connection.hasEdit = true;
  }

  loadDetails(): Promise<WorldDetails> {
    return Promise.resolve({
      name: this.#name,
      width: this.#width,
      height: this.#height,
      owner: undefined,
      ownerId: undefined,
    });
  }

  saveDetails(details: WorldDetails): Promise<void> {
    if (this.#width !== details.width)
      throw new Error("Can't change world size.");
    if (this.#height !== details.height)
      throw new Error("Can't change world size.");

    this.#name = details.name;

    return Promise.resolve();
  }

  loadBlocks(): Promise<WorldBlocks> {
    return Promise.resolve(
      JSON.parse(generateWorld(this.#width, this.#height))
    );
  }

  saveBlocks(): Promise<void> {
    return Promise.resolve();
  }
}
