import { BlockInfo } from "../TileRegistration";
import { BlockStoring } from "./BlockStoring";

export class SourceAndIdStorage implements BlockStoring {
  readonly indexToId: Map<number, number> = new Map();
  readonly idToIndex: Map<number, number> = new Map();

  constructor(readonly sourceId: number) {}

  connectMany(blocks: BlockInfo[]) {
    let i = 0;
    for (const block of blocks) {
      this.connect(block, i);
      i += 1;
    }
  }

  connect(block: BlockInfo, index: number) {
    this.indexToId.set(index, block.id);
    this.idToIndex.set(block.id, index);
  }

  serialize(id: number): [number, number] {
    const index = this.idToIndex.get(id);
    if (index === undefined) throw new Error("couldn't convert id to index");
    return [this.sourceId, index];
  }

  deserialize([sourceId, index]: [number, number]): [number, undefined] {
    if (this.sourceId !== sourceId)
      throw new Error("`deserialize` should be called with the right `category`");

    const id = this.indexToId.get(index);
    if (id === undefined) throw new Error("couldnt convert index to id");

    return [id, undefined];
  }
}
