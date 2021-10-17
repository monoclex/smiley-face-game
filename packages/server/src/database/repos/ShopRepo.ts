import { Connection, Repository } from "typeorm";
import bcrypt from "bcrypt";
import Account from "../../database/models/Account";
import World from "../../database/models/World";
import AccountLike from "../../database/modelishs/AccountLike";
import ensureValidates from "../../ensureValidates";
import { zAccountId, zEmail, zPassword, zShopItemId, zUsername } from "@smiley-face-game/api/types";
import ShopItem from "../models/ShopItem";

export default class ShopRepo {
  readonly #repo: Repository<ShopItem>;

  constructor(repo: Repository<ShopItem>) {
    this.#repo = repo;
  }

  findItemInfo(account: AccountLike): Promise<ShopItem[]> {
    ensureValidates(zAccountId, account.id);

    return this.#repo.find({ where: { user: { id: account.id } } });
  }

  async getItem(account: AccountLike, shopItemId: number): Promise<ShopItem> {
    ensureValidates(zAccountId, account.id);
    ensureValidates(zShopItemId, shopItemId);

    try {
      return await this.#repo.findOneOrFail({ where: { user: account, shopItemId: shopItemId } });
    } catch {
      // if we failed to find it, it probably doesn't exist - create it now

      try {
        await this.#repo.insert({
          user: account,
          shopItemId: shopItemId,
          spentEnergy: 0,
          purchased: 0,
        });
      } catch {
        // if we failed to create it, it probably already exists (le data race)
      }

      // at this point, the item must exist - try find it again
      return await this.#repo.findOneOrFail({ where: { user: account, shopItemId: shopItemId } });
    }
  }

  save(item: ShopItem): Promise<ShopItem> {
    return this.#repo.save(item);
  }
}
