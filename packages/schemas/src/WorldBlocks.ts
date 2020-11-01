import { Block, BlockSchema } from "@smiley-face-game/schemas/Block";
import { array } from "computed-types";

export const WorldBlocksSchema = array.of(array.of(array.of(BlockSchema)));
export type WorldBlocksType = Block[][][];
