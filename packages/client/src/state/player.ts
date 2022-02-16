import { atom, DefaultValue, selector } from "recoil";
import { tokenState } from "./auth";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";
import { ZPlayerResp } from "@smiley-face-game/api/api";

export const playerInfoCacheAtom = atom<null | { token: string; player: ZPlayerResp }>({
  key: "playerInfoCacheAtom",
  default: null,
});

export const playerInfoSelector = selector<ZPlayerResp>({
  key: "playerInfoSelector",
  get: async ({ get }) => {
    console.log("playerInfoSelector called");
    await routesRewritten.handle;

    console.log("playerInfoSelector authentication...");
    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    // console.log("playerInfoSelector cache?");
    // const cache = get(playerInfoCacheAtom);
    // if (cache !== null && cache.token === token) {
    //   console.log("playerInfoSelector cached!", cache);
    //   return cache.player;
    // }

    console.log("playerInfoSelector loading...");
    const auth = new Authentication(token);
    return await auth.player();
  },
  set: ({ get, set, reset }, player) => {
    if (player instanceof DefaultValue) {
      // reset(playerInfoSelector);
      reset(playerInfoCacheAtom);
      return;
    }

    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    set(playerInfoCacheAtom, { token, player });
  },
});
