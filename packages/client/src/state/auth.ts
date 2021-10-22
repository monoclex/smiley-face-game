import { atom } from "recoil";
import SharedGlobal from "./SharedGlobal";

type Token = string | null;

export const tokenGlobal = new SharedGlobal<Token>(localStorage.getItem("token"), (token) => {
  if (token === null) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
});

export const tokenState = atom<Token>({
  key: "tokenState",
  default: null,
  effects_UNSTABLE: [tokenGlobal.initialize],
});
