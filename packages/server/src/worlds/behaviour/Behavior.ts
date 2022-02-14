import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";
import type { ZWorldDetails, ZWorldBlocks, ZHeaps, ZHeap } from "@smiley-face-game/api/types";
import type Connection from "../../worlds/Connection";

export default interface Behaviour {
  readonly id: string;

  onPlayerJoin(connection: Connection): void;

  loadBlocks(): Promise<[WorldLayer<number>, WorldLayer<ZHeap | 0>]>;
  saveBlocks(blocks: ZWorldBlocks, heaps: ZHeaps): Promise<void>;

  loadDetails(): Promise<ZWorldDetails>;
  saveDetails(details: ZWorldDetails): Promise<void>;
}
