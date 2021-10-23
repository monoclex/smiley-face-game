import { useRecoilValue } from "recoil";
import { playerInfoState } from "../../state";

export function usePlayer() {
  return useRecoilValue(playerInfoState);
}
