import AccountLike from "@/database/modelishs/AccountLike";
import AccountRepo from "@/database/repos/AccountRepo";
import ShopItem from "./ShopItem";

export default class Purchaser {
  readonly #repo: AccountRepo;

  constructor(accountRepo: AccountRepo) {
    this.#repo = accountRepo;
  }

  // TODO: make purchasing things have a set price counter increment or something, this is omega TODO
  purchase<TConfig = undefined>(
    account: AccountLike,
    item: ShopItem<TConfig>,
    config: TConfig
  ): "no" | "yes" {
    const price = this.price(item, config);

    if (account.currentEnergy < price) {
      return "no";
    } else {
      return "yes";
    }
  }

  private price<TConfig = undefined>(
    item: ShopItem<TConfig>,
    config: TConfig
  ): number {
    if (typeof item.price === "number") {
      return item.price;
    } else {
      return item.price(config);
    }
  }
}
