import { useRecoilValue } from "recoil";
import { lobbySelector } from "../../state";

export function useLobby() {
  return useRecoilValue(lobbySelector);
}
