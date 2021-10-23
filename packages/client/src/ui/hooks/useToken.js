import { useRecoilState } from "recoil";
import { tokenState } from "../../state";

export function useToken() {
  return useRecoilState(tokenState);
}
