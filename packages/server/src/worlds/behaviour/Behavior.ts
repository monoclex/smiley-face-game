import type { ZWorldDetails, ZWorldBlocks, ZHeaps } from "@smiley-face-game/api/types";
import type Connection from "../../worlds/Connection";

export default interface Behaviour {
  readonly id: string;

  onPlayerJoin(connection: Connection): void;

  loadBlocks(): Promise<[ZWorldBlocks, ZHeaps]>;
  saveBlocks(blocks: ZWorldBlocks, heaps: ZHeaps): Promise<void>;

  loadDetails(): Promise<ZWorldDetails>;
  saveDetails(details: ZWorldDetails): Promise<void>;
}
