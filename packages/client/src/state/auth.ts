import { atom } from "recoil";
import SharedGlobal from "./SharedGlobal";

// typescript likes to maul `token` and coerce `string | null` to `string` which is BD
export type Token = string | false;

export const tokenGlobal = new SharedGlobal<Token>(localStorage.getItem("token") ?? false, (token) => {
  if (token === false) localStorage.removeItem("token");
  else localStorage.setItem("token", token);
});

export const tokenState = atom<Token>({
  key: "tokenState",
  default: false,
  effects_UNSTABLE: [tokenGlobal.initialize],
});
