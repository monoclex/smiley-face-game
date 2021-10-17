import { Authentication } from "@smiley-face-game/api";
import { ZShopItem } from "@smiley-face-game/api/types";
import { useEffect, useState } from "react";

// rather than have a bunch of small files for hooks,
// we have one big file so that way intellisense will autocomplete the hooks

export function useAuth(): Authentication {
  const token = localStorage.getItem("token");

  if (token === null) {
    throw new Error("`useAuth` should only be called from authenticated routes");
  }

  return new Authentication(token);
}

export function useShopItems(): undefined | Error | ZShopItem[] {
  const auth = useAuth();
  const [shopItems, setShopItems] = useState<undefined | Error | ZShopItem[]>(undefined);

  useEffect(() => {
    auth
      .shopItems()
      .then(({ items }) => setShopItems(items))
      .catch(setShopItems);
  }, []);

  return shopItems;
}
