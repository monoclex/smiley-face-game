import { Connection, Repository } from "typeorm";
import bcrypt from "bcrypt";
import Account from "../../database/models/Account";
import World from "../../database/models/World";
import AccountLike from "../../database/modelishs/AccountLike";
import ensureValidates from "../../ensureValidates";
import { zAccountId, zEmail, zPassword, zUsername } from "@smiley-face-game/api/types";
import ShopItem from "../models/ShopItem";

// TODO: should this be made a Schema?
interface ShopDetails {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly worlds?: World[];
}

export default class ShopRepo {
  readonly #repo: Repository<ShopItem>;

  constructor(connection: Connection) {
    this.#repo = connection.getRepository(ShopItem);
  }
}
