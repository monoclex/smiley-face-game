import { ZShopItem, ZShopItemId } from "@smiley-face-game/api/types";
import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { tokenGlobal } from "./auth";
import { GameState } from "../game/StateSystem";
import SharedGlobal from "./SharedGlobal";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";

export const shopItemsState = atom<ZShopItem[]>({
  key: "shopItemsState",
  default: (async () => {
    await routesRewritten.handle;

    const token = tokenGlobal.state;
    if (token === null) throw new Error("Not authenticated!");

    // in theory, tree shaking should make this only happen on /shop
    // but i don't think that will happen as bundlers will generally
    // try to preserve semantics methinks (or will they? :think:)
    console.warn("loading shop items now");

    const auth = new Authentication(token);
    const { items } = await auth.shopItems();
    return items;
  })(),
});

export const shopItemQuery = selectorFamily<ZShopItem, ZShopItemId>({
  key: "shopItemQuery",
  get:
    (itemId) =>
    ({ get }) => {
      const shopItems = get(shopItemsState);

      const item = shopItems.find(({ id }) => itemId === id);
      if (item == undefined) throw new Error("Could not find shop item!");

      return item;
    },
  set:
    (itemId) =>
    ({ set }, newValue) => {
      if (newValue instanceof DefaultValue) throw new Error("Cannot set to default value!");

      let didChange = false;

      set(shopItemsState, (shopItems) =>
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
