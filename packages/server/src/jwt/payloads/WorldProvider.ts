import * as jwt from "jsonwebtoken";
import { validateDynamicWorldName } from "@smiley-face-game/api/schemas/web/game/ws/DynamicWorldName";
import { validateDynamicWidth } from "@smiley-face-game/api/schemas/web/game/ws/DynamicWidth";
import { validateDynamicHeight } from "@smiley-face-game/api/schemas/web/game/ws/DynamicHeight";
import { validateWorldId } from "@smiley-face-game/api/schemas/WorldId";
import ensureValidates from "@/ensureValidates";
import WorldPayload from "./WorldPayload";

export default class WorldProvider {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  /**
   * Generates a JWT that only allows the player to join a saved world.
   * @param worldId The World Id
   */
  joinSaved(worldId: string): string {
    ensureValidates(validateWorldId, worldId);

    const payload: WorldPayload = {
      ver: 1,
      det: { type: "saved", id: worldId }
    };

    return jwt.sign(payload, this.#secret, { expiresIn: "1 minute" });
  }

  /**
   * Generates a JWT that oly allows the player to join a dynamic world.
   * @param name The name of the world.
   * @param width The width of the world.
   * @param height The height of the world.
   */
  joinDynamic(name: string, width: number, height: number): string {
    ensureValidates(validateDynamicWorldName, name);
    ensureValidates(validateDynamicWidth, width);
    ensureValidates(validateDynamicHeight, height);

    const payload: WorldPayload = {
      ver: 1,
      det: { type: "dynamic", id: undefined, name, width, height }
    };

    return jwt.sign(payload, this.#secret, { expiresIn: "1 minute" });
  }
}