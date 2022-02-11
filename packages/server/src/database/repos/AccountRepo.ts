import { Repository } from "typeorm";
import bcrypt from "bcryptjs";
import Account from "../../database/models/Account";
import World from "../../database/models/World";
import AccountLike from "../../database/modelishs/AccountLike";
import ensureValidates from "../../ensureValidates";
import { zAccountId, zEmail, zPassword, zUsername } from "@smiley-face-game/api/types";

// TODO: should this be made a Schema?
interface AccountDetails {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly worlds?: World[];
}

export default class AccountRepo {
  readonly #repo: Repository<Account>;

  constructor(repo: Repository<Account>) {
    this.#repo = repo;
  }

  /* === queries === */

  findById(id: string): Promise<AccountLike> {
    ensureValidates(zAccountId, id);
    return this.#repo.findOneOrFail({ id }, {});
  }

  // TODO: do this better
  findByIdWithWorlds(id: string): Promise<Account> {
    ensureValidates(zAccountId, id);
    return this.#repo.findOneOrFail({ id }, { relations: ["worlds"] });
  }

  findByUsername(username: string): Promise<AccountLike> {
    ensureValidates(zUsername, username);
    return this.#repo.findOneOrFail({ username });
  }

  findByEmail(email: string): Promise<AccountLike> {
    ensureValidates(zEmail, email);
    return this.#repo.findOneOrFail({ email });
  }

  /* === creation === */

  async create(details: AccountDetails): Promise<Account> {
    ensureValidates(zUsername, details.username);
    ensureValidates(zEmail, details.email);
    ensureValidates(zPassword, details.password);

    // all computed assignments are stated in plain sight before assignment
    const password = await bcrypt.hash(details.password, 10);
    const worlds = details.worlds ?? [];

    const account = this.#repo.create();
    account.username = details.username;
    account.email = details.email;
    account.password = password;
    account.maxEnergy = 100;
    account.lastEnergyAmount = 100;
    account.timeEnergyWasAtAmount = "" + Date.now();
    account.energyRegenerationRateMs = 5 * 60 * 1000;
    account.worlds = worlds;

    return await this.#repo.save(account);
  }

  verifyPassword(account: AccountLike, password: string): Promise<boolean> {
    const accountPassword = account.password;
    return bcrypt.compare(password, accountPassword);
  }

  /* === modification === */

  save(account: Account | AccountLike): Promise<Account> {
    return this.#repo.save(account);
  }
}
