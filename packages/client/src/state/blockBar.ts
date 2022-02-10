import type { BlockInfo } from "@smiley-face-game/api/tiles/TileRegistration";

export type SelectedBlock = BlockInfo | undefined;

/**
 * read-only global state
 */
export const selectedBlockState: { it: SelectedBlock } = { it: undefined };
