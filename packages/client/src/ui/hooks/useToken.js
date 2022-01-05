import { useRecoilState, useSetRecoilState } from "recoil";
import { tokenState } from "../../state";

export function useToken() {
  return useRecoilState(tokenState);
}

export function useSetToken() {
  return useSetRecoilState(tokenState);
}
