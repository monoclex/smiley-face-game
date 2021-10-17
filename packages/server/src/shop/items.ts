import { Category, CategoryType } from "@smiley-face-game/api/enums";

/**
 * Interface that defines what one a potential shop item is.
 * These are used in producing ZShopItems that are given to players.
 */
export interface ShopItem {
  id: number;
  title: string;
  description: string;
  dateIntroduced: Date;
  category: Category;
  categoryType: CategoryType;
  limited: boolean;
  energyCost: number;
}

export const shopItems: ShopItem[] = [
  {
    id: 0,
    title: "200 x 200 World",
    description: "what a nicely sized world",
    dateIntroduced: new Date("Sun, 17 Oct 2021 04:20:00 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 5000,
  },
  {
    id: 1,
    title: "30 x 30",
    description: "what a small little world",
    dateIntroduced: new Date("Sun, 17 Oct 2021 13:37:00 GMT"),
    category: Category.World,
    categoryType: CategoryType.None,
    limited: false,
    energyCost: 360,
  },
];
