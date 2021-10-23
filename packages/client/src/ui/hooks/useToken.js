import { useRecoilValue } from "recoil";
import { tokenState } from "../../state";

/** @returns {string | null} */
export function useToken() {
  return useRecoilValue(tokenState);
}
