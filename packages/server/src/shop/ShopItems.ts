import ShopItem from "./ShopItem";

interface WorldConfig {
  readonly width: number;
  readonly height: number;
}

export const World: ShopItem<WorldConfig> = {
  id: "world",
  price: (config) => (config.width / 5) * (config.height / 5),
};

export const Happy: ShopItem = {
  id: "smiley-happy",
  price: 100,
};
