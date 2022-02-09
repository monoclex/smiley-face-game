import { BlockStoring } from "./BlockStoring";

export class SourceAndIdStorage implements BlockStoring {
  readonly category: number;

  constructor(readonly sourceId: number, readonly index: number) {
    this.category = sourceId;
  }

  serialize(heap: undefined): number[] {
    return [this.sourceId, this.index];
  }

  deserialize([sourceId, index]: number[]): undefined {
    if (this.sourceId !== sourceId) throw new Error("`deserialize` should be called with the right `category`");

    throw new Error("TODO: figure out what to return");
    return undefined;
  }
}
