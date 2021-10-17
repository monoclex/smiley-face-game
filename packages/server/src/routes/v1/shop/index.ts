import { Router } from "express";
import jwt from "../../../middlewares/jwt";
import Dependencies from "../../../dependencies";
import { ZShopItem } from "@smiley-face-game/api/types";
import { shopItems } from "../../../shop/items";
import { ZShopItemsResp } from "@smiley-face-game/api/api";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "accountRepo" | "shopRepo">;

export default function (deps: UsedDependencies): Router {
  const { authVerifier, accountRepo, shopRepo } = deps;

  const router = Router();

  router.get(
    "/items",
    jwt(authVerifier, async (req, res) => {
      if (req.jwt.aud === "") {
        res.status(400).json({ error: "Cannot load shop items as guest" });
        return;
      }

      const account = await accountRepo.findById(req.jwt.aud);
      const spentItems = await shopRepo.findItemInfo(account);

      const items: ZShopItem[] = [];

      for (const item of shopItems) {
        const spentItem = spentItems.find((spentItem) => spentItem.shopItemId === item.id);

        items.push({
          ...item,
          limit: item.limited ? 1 : 0,
          owned: spentItem?.purchased ?? 0,
          energySpent: spentItem?.spentEnergy ?? 0,
        });
      }

      const response: ZShopItemsResp = { items };
      res.json(response);
    })
  );

  return router;
}
