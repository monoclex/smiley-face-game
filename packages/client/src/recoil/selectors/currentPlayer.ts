import { selector } from "recoil";
import { gameState } from "../atoms/gameState";

export default selector({
  key: "currentPlayer",
  get: ({ get }) => get(gameState).self,
});
