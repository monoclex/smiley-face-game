import { WorldDetails } from "@smiley-face-game/schemas/WorldDetails";
import WorldBlocks from "../../worlds/WorldBlocks";
import Connection from "../../worlds/Connection";

export default interface Behaviour {
  readonly id: string;

  onPlayerJoin(connection: Connection): void;

  loadBlocks(): Promise<WorldBlocks>;
  saveBlocks(blocks: WorldBlocks): Promise<void>;

  loadDetails(): Promise<WorldDetails>;
  saveDetails(details: WorldDetails): Promise<void>;
}
