import { atom } from "recoil";
import PromiseCompletionSource from "../PromiseCompletionSource";
import SharedGlobal from "./SharedGlobal";

interface SignState {
  open: boolean;
}

const defaultSignState: SignState = {
  open: false,
};

export const signGlobal = new SharedGlobal<SignState>(defaultSignState);
export const text = { it: new PromiseCompletionSource<string>() };

export const signState = atom<SignState>({
  key: "signState",
  default: defaultSignState,
  effects_UNSTABLE: [signGlobal.initialize],
});
