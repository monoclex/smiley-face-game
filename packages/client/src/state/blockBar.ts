import { MutableVariable } from "@/util/MutableVariable";
import { BlockInfo } from "@smiley-face-game/api/tiles/register";

export const selectedBlock = new MutableVariable<BlockInfo | undefined>(undefined);
