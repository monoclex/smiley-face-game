import type { Connection } from "@smiley-face-game/api";
import { selector } from "recoil";
import type ClientGame from "../../game/client/ClientGame";
import { maybeGameState } from "../atoms/maybeConnection";

export default selector<ClientGame>({
  key: "game",
  get: ({ get }) => {
    const maybeGame = get(maybeGameState);

    if (maybeGame === undefined) throw new Error("expected game, didn't get game");

    return maybeGame;
  },
});
