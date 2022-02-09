export interface BlockStoring<H = undefined> {
  readonly category: number | undefined;
  serialize(heap: H): number[];
  deserialize(data: number[]): H;
}
