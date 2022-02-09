import { BlockStoring } from "./BlockStoring";

export class EmptyStoring implements BlockStoring {
  readonly category: number | undefined = undefined;

  serialize(heap: undefined): number[] {
    return [];
  }

  deserialize(data: number[]): undefined {
    return undefined;
  }
}
