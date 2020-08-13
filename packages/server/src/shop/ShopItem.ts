export default interface ShopItem<TConfig = undefined> {
  readonly id: string;
  readonly price: number | ((config: TConfig) => number);
}
