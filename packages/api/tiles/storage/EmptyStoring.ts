import { BlockStoring } from "./BlockStoring";

export class EmptyStoring implements BlockStoring {
  readonly category: number | undefined = undefined;

  serialize(id: number, heap: undefined): [number, ...any] | [] {
    return [];
  }

  deserialize(data: [number, ...any] | []): [number, undefined] {
    return [0, undefined];
  }
}
