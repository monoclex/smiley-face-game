import * as jwt from "jsonwebtoken";
import { validateWorldId } from "@smiley-face-game/api/schemas/WorldId";
import ensureValidates from "@/ensureValidates";
import WorldPayload from "./WorldPayload";

export default class WorldProvider {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  /**
   * Generates a JWT that only allows the player to join the saved world.
   * @param worldId The World Id
   */
  join(worldId: string): string {
    ensureValidates(validateWorldId, worldId);

    const payload: WorldPayload = {
      ver: 1
    };

    return jwt.sign(payload, this.#secret, { expiresIn: "1 minute" });
  }
}