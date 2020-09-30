import { Player } from "@/recoil/atoms/playerList";
import { selector } from "recoil";
import { playerListState } from "../atoms/playerList";

export default selector<Player | undefined>({
  key: "currentPlayer",
  get: ({ get }) => get(playerListState).players.find(player => player.playerId === window?.gameScene?.mainPlayer?.id)
});