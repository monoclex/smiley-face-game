import { WorldDetails } from "@smiley-face-game/api/schemas/WorldDetails";
import WorldBlocks from "@/worlds/WorldBlocks";

export default interface Behaviour {
  readonly id: string;

  loadBlocks(): Promise<WorldBlocks>;
  saveBlocks(blocks: WorldBlocks): Promise<void>;

  loadDetails(): Promise<WorldDetails>;
  saveDetails(details: WorldDetails): Promise<void>;
}
