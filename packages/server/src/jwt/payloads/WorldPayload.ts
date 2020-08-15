import { WorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";

// See `AuthPayload` for the header comment on why the names here are shortened.

export default interface WorldPayload {
  /**
   * See `AuthPayload.ver`.
   */
  ver: 1;

  /**
   * Info about the world being created.
   */
  det: WorldDetails;
}
