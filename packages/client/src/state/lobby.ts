import { atom, DefaultValue, selector } from "recoil";
import { tokenState } from "./auth";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";
import { ZLobbyResp } from "@smiley-face-game/api/api";

const lobbyCacheAtom = atom<null | { token: string; response: ZLobbyResp }>({
  key: "lobbyCacheAtom",
  default: null,
});

export const lobbySelector = selector<ZLobbyResp>({
  key: "lobbySelector",
  get: async ({ get }) => {
    await routesRewritten.handle;

    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    // const cache = get(lobbyCacheAtom);
    // if (cache !== null && cache.token === token) return cache.response;

    const auth = new Authentication(token);
    return await auth.lobby();
  },
  set: ({ get, set, reset }, response) => {
    if (response instanceof DefaultValue) {
      reset(lobbyCacheAtom);
      // reset(lobbySelector);

      return;
    }

    const token = get(tokenState);
    if (!token) throw new Error("Not authenticated!");

    set(lobbyCacheAtom, { token, response });
  },
});
