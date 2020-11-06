import type { ZWorldDetails, ZWorldBlocks } from "@smiley-face-game/common/types";
import type Connection from "../../worlds/Connection";

export default interface Behaviour {
  readonly id: string;

  onPlayerJoin(connection: Connection): void;

  loadBlocks(): Promise<ZWorldBlocks>;
  saveBlocks(blocks: ZWorldBlocks): Promise<void>;

  loadDetails(): Promise<ZWorldDetails>;
  saveDetails(details: ZWorldDetails): Promise<void>;
}
