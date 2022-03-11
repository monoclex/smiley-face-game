import { MutableVariable } from "@/util/MutableVariable";
import { BlockInfo } from "@smiley-face-game/api/tiles/register";

/**
 * A variable that has currently selected block stored in it. This is only
 * written to by the React UI code, and read once every animation frame by
 * the game.
 */
export const selectedBlock = new MutableVariable<BlockInfo | undefined>(undefined);
