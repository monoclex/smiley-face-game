import * as jwt from "jsonwebtoken";
import { validateAccountId } from "@smiley-face-game/api/schemas/AccountId";
import ensureValidates from "@/ensureValidates";
import JwtPayload from "./JwtPayload";

export default class JwtProvider {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  /**
   * Generates a JWT that only authenticates the uswwwwwwwwwwwwwwwwwwwwwwwwer to play the game.
   * @param accountId The Account's Id to generate an authentication token for.
   */
  allowAuthentication(accountId: string): string {
    ensureValidates(validateAccountId, accountId);

    const payload: JwtPayload = {
      ver: 1,
      aud: accountId,
      can: ["authenticate"]
    };

    return jwt.sign(payload, this.#secret, { expiresIn: "1 hour" });
  }
}