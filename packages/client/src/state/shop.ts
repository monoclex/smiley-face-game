import { ZShopItem, ZShopItemId } from "@smiley-face-game/api/types";
import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { tokenState } from "./auth";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";

const shopItemsCacheAtom = atom<null | { token: string; items: ZShopItem[] }>({
  key: "shopItemsCacheAtom",
  default: null,
});

export const shopItemsSelector = selector<ZShopItem[]>({
  key: "shopItemsSelector",
  get: async ({ get }) => {
    await routesRewritten.handle;

    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    const cache = get(shopItemsCacheAtom);
    if (cache !== null && cache.token === token) return cache.items;

    const auth = new Authentication(token);
    const { items } = await auth.shopItems();
    return items;
  },
  set: ({ get, set }, items) => {
    if (items instanceof DefaultValue) throw new Error("Cannot assign default value");

    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    set(shopItemsCacheAtom, { token, items });
  },
});

export const shopItemQuery = selectorFamily<ZShopItem, ZShopItemId>({
  key: "shopItemQuery",
  get:
    (itemId) =>
    ({ get }) => {
      const shopItems = get(shopItemsSelector);

      const item = shopItems.find(({ id }) => itemId === id);
      if (item == undefined) throw new Error("Could not find shop item!");

      return item;
    },
  set:
    (itemId) =>
    ({ set }, newValue) => {
      if (newValue instanceof DefaultValue) throw new Error("Cannot set to default value!");

      let didChange = false;

      set(shopItemsSelector, (shopItems) =>
        shopItems.map((item) => {
          if (item.id === itemId) {
            didChange = true;
            return newValue;
          } else return item;
        })
      );

      if (!didChange) throw new Error("Did not change value!");
    },
});
