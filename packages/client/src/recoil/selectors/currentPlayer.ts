import { Player } from "../../recoil/atoms/playerList";
import { selector } from "recoil";
import { playerListState } from "../atoms/playerList";

export default selector<Player | undefined>({
  key: "currentPlayer",
  get: ({ get }) =>
    //@ts-ignore
    get(playerListState).players.find((player) => player.playerId === window.HACK_FIX_LATER_selfId),
});
