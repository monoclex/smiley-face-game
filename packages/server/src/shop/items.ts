import { Category, CategoryType } from "@smiley-face-game/api/enums";
import { EntityManager } from "typeorm";
import AccountLike from "../database/modelishs/AccountLike";
import makePurchaser from "./purchaseWorld";

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
  columnSpan?: number;
  purchase: (user: AccountLike, entityManager: EntityManager) => Promise<void>;
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
    purchase: makePurchaser(200, 200),
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
    columnSpan: 2,
    purchase: makePurchaser(30, 30),
  },
  {
    id: 2,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 3,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 4,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 5,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 6,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 7,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 8,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
  {
    id: 9,
    title: "6 x 9",
    description: "a really tiny world just as a test for development (will be deleted later)",
    dateIntroduced: new Date("Sun, 18 Oct 2021 00:04:20 GMT"),
    category: Category.World,
    categoryType: CategoryType.Featured,
    limited: false,
    energyCost: 21,
    purchase: makePurchaser(6, 9),
  },
];
