export interface BlockStoring<H = undefined> {
  readonly category: number | undefined;
  serialize(id: number, heap: H): [number, ...any] | [];
  deserialize(data: [number, ...any] | []): [number, H];
}
