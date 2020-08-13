import { Connection, Repository } from "typeorm";
import { sha256 } from "js-sha256";
import { validateUsername } from "@smiley-face-game/api/schemas/Username";
import { validateEmail } from "@smiley-face-game/api/schemas/Email";
import { validatePassword } from "@smiley-face-game/api/schemas/Password";
import { validateAccountId } from "@smiley-face-game/api/schemas/AccountId";
import Account from "@/database/models/Account";
import World from "@/database/models/World";
import AccountLike from "@/database/modelishs/AccountLike";
import ensureValidates from "./ensureValidates";

// TODO: should this be made a Schema?
interface AccountDetails {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly worlds?: World[];
}

export default class AccountRepo {
  readonly #repo: Repository<Account>;

  constructor(connection: Connection) {
    this.#repo = connection.getRepository(Account);
  }

  /* === queries === */

  findById(id: string): Promise<AccountLike> {
    ensureValidates(validateAccountId, id);
    return this.#repo.findOneOrFail({ id }, {  });
  }

  findByUsername(username: string): Promise<AccountLike> {
    ensureValidates(validateUsername, username);
    return this.#repo.findOneOrFail({ username });
  }

  findByEmail(email: string): Promise<AccountLike> {
    ensureValidates(validateEmail, email);
    return this.#repo.findOneOrFail({ email });
  }

  /* === creation === */

  create(details: AccountDetails): Promise<Account> {
    ensureValidates(validateUsername, details.username);
    ensureValidates(validateEmail, details.email);
    ensureValidates(validatePassword, details.password);

    // all computed assignments are stated in plain sight before assignment
    const password = sha256.hex(details.password);
    const worlds = details.worlds ?? [];

    let account = this.#repo.create();
    account.username = details.username;
    account.email = details.email;
    account.password = password;
    account.worlds = worlds;

    return this.#repo.save(account);
  }
}
