import { atom } from "recoil";
import { tokenGlobal } from "./auth";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";
import { ZPlayerResp } from "@smiley-face-game/api/api";

export const playerInfoState = atom<ZPlayerResp>({
  key: "playerInfoState",
  default: (async () => {
    await routesRewritten.handle;

    const token = tokenGlobal.state;
    if (!token) throw new Error("Not authenticated!");

    const auth = new Authentication(token);
    return await auth.player();
  })(),
});
