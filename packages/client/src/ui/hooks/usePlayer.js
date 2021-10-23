import { useRecoilValue } from "recoil";
import { playerInfoSelector } from "../../state";

export function usePlayer() {
  return useRecoilValue(playerInfoSelector);
}
