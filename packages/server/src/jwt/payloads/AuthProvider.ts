import * as jwt from "jsonwebtoken";
import { zAccountId, zUsername } from "@smiley-face-game/api/types";
import ensureValidates from "../../ensureValidates";
import AuthPayload from "./AuthPayload";

export default class AuthProvider {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  /**
   * Generates a JWT that only authenticates the Account to play the game.
   * @param accountId The Account's Id to generate an authentication token for.
   */
  allowAuthentication(accountId: string): string {
    ensureValidates(zAccountId, accountId);

    const payload: AuthPayload = {
      ver: 1,
      aud: accountId,
      can: ["play"],
    };

    return jwt.sign(payload, this.#secret, { expiresIn: "1 hour" });
  }

  /**
   * Generates a JWT that only authenticates a Guest to play the game.
   * @param name The name for the Guest.
   */
  allowGuestAuthentication(name: string) {
    ensureValidates(zUsername, name);

    const payload: AuthPayload = {
      ver: 1,
      aud: "",
      name,
      can: ["play"],
    };

    // generate a token that never expires
    // this is fine, because in new versions of the code `ver` will be changed (and thus, failing checks elsewhere)
    // and because the only data associated with this is the guest username, there will never be any issues.
    return jwt.sign(payload, this.#secret);
  }
}
