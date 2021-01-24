import { selector } from "recoil";
import { gameState } from "./gameState";

export default selector({
  key: "playerList",
  get: ({ get }) => [...get(gameState).players].sort((player) => player.id),
});
