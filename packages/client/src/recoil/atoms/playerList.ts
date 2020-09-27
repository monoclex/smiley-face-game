import { atom } from "recoil";
import SharedGlobal from "@/recoil/SharedGlobal";
import PlayerRole from "@smiley-face-game/api/PlayerRole";

export interface PlayerListState {
  players: Player[]
}

export interface Player {
  playerId: number,
  username: string,
  role: PlayerRole,
}

export const defaultPlayerListState: PlayerListState = {
  players: []
};

export const playerList = new SharedGlobal<PlayerListState>(defaultPlayerListState);

export const playerListState = atom<PlayerListState>({
  key: "playerListState",
  default: defaultPlayerListState,
  //@ts-ignore
  effects_UNSTABLE: [playerList.initialize],
});
