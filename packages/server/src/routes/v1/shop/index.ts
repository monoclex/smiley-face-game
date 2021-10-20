import { Router } from "express";
import jwt from "../../../middlewares/jwt";
import Dependencies from "../../../dependencies";
import { ZShopItem } from "@smiley-face-game/api/types";
import { shopItems } from "../../../shop/items";
import { ZShopBuyReq, zShopBuyReq, ZShopBuyResp, ZShopItemsResp } from "@smiley-face-game/api/api";
import asyncHandler, { handleJwtAsync } from "../../../middlewares/asyncHandler";
import AuthPayload from "../../../jwt/payloads/AuthPayload";
import schema from "../../../middlewares/schema";
import ShopRepo from "../../../database/repos/ShopRepo";
import ShopItem from "../../../database/models/ShopItem";
import AccountRepo from "../../../database/repos/AccountRepo";
import Account from "../../../database/models/Account";
import AccountLike from "../../../database/modelishs/AccountLike";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "accountRepo" | "shopRepo" | "connection">;

export default function (deps: UsedDependencies): Router {
  const { authVerifier, accountRepo, shopRepo, connection } = deps;

  const router = Router();

  router.get(
    "/items",
    jwt(
      authVerifier,
      handleJwtAsync(async (req, res) => {
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
            // we do not spread `item` because it could contain things we don't want to send
            id: item.id,
            title: item.title,
            description: item.description,
            dateIntroduced: item.dateIntroduced,
            category: item.category,
            categoryType: item.categoryType,
            limit: item.limited ? 1 : 0,
            owned: spentItem?.purchased ?? 0,
            energySpent: spentItem?.spentEnergy ?? 0,
            energyCost: item.energyCost,
            columnSpan: item.columnSpan,
          });
        }

        const response: ZShopItemsResp = { items };
        res.json(response);
      })
    )
  );

  router.post(
    "/buy",
    jwt(
      authVerifier,
      schema(
        zShopBuyReq,
        //@ts-expect-error help
        handleJwtAsync(async (req, res) => {
          if (req.jwt.aud === "") throw new Error("guests cant buy items");

          const body: ZShopBuyReq = req.body as unknown as ZShopBuyReq;

          const shopItemInfo = shopItems.find((item) => item.id === body.id);
          if (shopItemInfo === undefined) throw new Error(`no item with id ${body.id} exists`);

          const { account, item, purchased } = await connection.transaction("SERIALIZABLE", async (entityManager) => {
            // https://www.postgresql.org/docs/9.5/transaction-iso.html#XACT-SERIALIZABLE

            const accountRepo = new AccountRepo(entityManager.getRepository(Account));
            const shopRepo = new ShopRepo(entityManager.getRepository(ShopItem));

            const account = await accountRepo.findById(req.jwt.aud);
            const item = await shopRepo.getItem(account, body.id);

            if (shopItemInfo.limited && item.purchased > 0) throw new Error("you have already purchased this item!");

            // if we are spending more energy than we need to, we don't want to
            const maxNeededToSpend = Math.min(shopItemInfo.energyCost - item.spentEnergy, body.spendEnergy);

            // we don't want to spend negative energy
            const energyToSpend = Math.max(0, maxNeededToSpend);

            if (account.currentEnergy < energyToSpend)
              throw new Error(`you do not have ${energyToSpend} energy! you only have ${account.currentEnergy}`);

            // perform the transaction
            account.currentEnergy -= energyToSpend;
            item.spentEnergy += energyToSpend;

            if (item.spentEnergy > shopItemInfo.energyCost) {
              // the item has more spent energy than the cost of it
              // most likely, the maximum energy values have been adjusted
              //
              // refund the user the excess energy
              const excessEnergy = item.spentEnergy - shopItemInfo.energyCost;

              item.spentEnergy -= excessEnergy;
              account.currentEnergy += excessEnergy;
            }

            const shouldPurchaseItem = item.spentEnergy === shopItemInfo.energyCost;
            if (shouldPurchaseItem) {
              // we have enough energy to purchase one item
              item.spentEnergy = 0;
              item.purchased += 1;
              await shopItemInfo.purchase(account, entityManager);
            }

            await accountRepo.save(account);
            await shopRepo.save(item);

            return { account, item, purchased: shouldPurchaseItem };
          });

          // we only use `account` and `item` to return a *view* of the
          // account & item at the last known "good" state

          const response: ZShopBuyResp = {
            id: shopItemInfo.id,
            purchased,
            item: {
              id: shopItemInfo.id,
              title: shopItemInfo.title,
              description: shopItemInfo.description,
              dateIntroduced: shopItemInfo.dateIntroduced,
              category: shopItemInfo.category,
              categoryType: shopItemInfo.categoryType,
              limit: shopItemInfo.limited ? 1 : 0,
              owned: item.purchased,
              energySpent: item.spentEnergy,
              energyCost: shopItemInfo.energyCost,
              columnSpan: shopItemInfo.columnSpan,
            },
            playerEnergy: {
              energy: account.currentEnergy,
              energyRegenerationRateMs: account.energyRegenerationRateMs,
              maxEnergy: account.maxEnergy,
              lastEnergyAmount: account.lastEnergyAmount,
              // TODO: don't have database store unix epoch timestamp as bigint lol
              timeEnergyWasAtAmount: parseInt(account.timeEnergyWasAtAmount),
            },
          };

          res.status(200).json(response);
        })
      )
    )
  );

  return router;
}
