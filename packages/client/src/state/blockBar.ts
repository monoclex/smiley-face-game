import { MutableVariable } from "@/util";
import { BlockInfo } from "@smiley-face-game/api/tiles/register";

export const selectedBlock = new MutableVariable<BlockInfo | undefined>(undefined);
