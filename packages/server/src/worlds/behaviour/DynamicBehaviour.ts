import { WorldJoinRequest, validateWorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import { WorldDetails } from "@smiley-face-game/api/schemas/WorldDetails";
import WorldBlocks from "@/worlds/WorldBlocks";
import ensureValidates from "@/ensureValidates";
import Behaviour from "./Behavior";
import generateWorld from "../generateWorld";

export default class DynamicBehaviour implements Behaviour {
  #name: string;
  #width: number;
  #height: number;

  readonly id: string;

  constructor(joinRequest: Exclude<Extract<WorldJoinRequest, { type: "dynamic" }>, { id: string }>, id: string) {
    ensureValidates(validateWorldJoinRequest, joinRequest);

    this.id = id;
    this.#name = joinRequest.name;
    this.#width = joinRequest.width;
    this.#height = joinRequest.height;
  }

  loadDetails(): Promise<WorldDetails> {
    return Promise.resolve({
      name: this.#name,
      width: this.#width,
      height: this.#height,
      owner: undefined,
      ownerId: undefined
    });
  }

  saveDetails(details: WorldDetails): Promise<void> {
    if (this.#width !== details.width) throw new Error("Can't change world size.");
    if (this.#height !== details.height) throw new Error("Can't change world size.");
    
    this.#name = details.name;

    return Promise.resolve();
  }

  loadBlocks(): Promise<WorldBlocks> {
    return Promise.resolve(JSON.parse(generateWorld(this.#width, this.#height)));
  }

  saveBlocks(blocks: WorldBlocks): Promise<void> {
    return Promise.resolve();
  }
}
