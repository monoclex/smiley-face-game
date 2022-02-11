export interface BlockStoring<H = undefined> {
  readonly sourceId: number | undefined;
  serialize(id: number, heap: H): [number, ...any] | [];
  deserialize(data: [number, ...any] | []): [number, H];
}
