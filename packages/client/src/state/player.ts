import { atom, selector } from "recoil";
import { tokenState } from "./auth";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";
import { ZPlayerResp } from "@smiley-face-game/api/api";

const playerInfoCacheAtom = atom<null | { token: string; player: ZPlayerResp }>({
  key: "playerInfoCacheAtom",
  default: null,
});

export const playerInfoSelector = selector<ZPlayerResp>({
  key: "playerInfoSelector",
  get: async ({ get }) => {
    await routesRewritten.handle;

    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    const cache = get(playerInfoCacheAtom);
    if (cache !== null && cache.token === token) return cache.player;

    const auth = new Authentication(token);
    return await auth.player();
  },
  set: ({ get, set }, player) => {
    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    set(playerInfoCacheAtom, { token, player });
  },
});
