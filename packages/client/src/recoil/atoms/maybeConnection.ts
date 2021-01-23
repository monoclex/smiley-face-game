import { atom } from "recoil";
import SharedGlobal from "../SharedGlobal";
import type Connection from "@smiley-face-game/api/src/Connection";

type MaybeConnectionState = WeakRef<Connection> | undefined;

export const defaultMaybeGameState: MaybeConnectionState = undefined;
export const maybeGame = new SharedGlobal<MaybeConnectionState>(defaultMaybeGameState);
export const maybeGameState = atom<MaybeConnectionState>({
  key: "maybeGameState",
  default: defaultMaybeGameState,
  //@ts-ignore
  effects_UNSTABLE: [maybeGame.initialize],
});
