import { ZShopItem, ZShopItemId } from "@smiley-face-game/api/types";
import { atom, DefaultValue, selector, selectorFamily } from "recoil";
import { tokenGlobal } from "./auth";
import { GameState } from "../game/StateSystem";
import SharedGlobal from "./SharedGlobal";
import { Authentication } from "@smiley-face-game/api";
import { routesRewritten } from "../rewritten";
import { ZPlayerResp } from "@smiley-face-game/api/api";

export const playerInfoState = atom<ZPlayerResp>({
  key: "playerInfoState",
  default: (async () => {
    await routesRewritten.handle;

    const token = tokenGlobal.state;
    if (token === null) throw new Error("Not authenticated!");

    const auth = new Authentication(token);
    return await auth.player();
  })(),
});
