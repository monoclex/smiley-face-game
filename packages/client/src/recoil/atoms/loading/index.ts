import { atom } from "recoil";
import SharedGlobal from "@/recoil/SharedGlobal";

export interface Loading {
  failed?: boolean;
  why?: string;
}

export const defaultLoading: Loading = {};
export const loading = new SharedGlobal<Loading>(defaultLoading);
export const loadingState = atom<Loading>({
  key: "loadingState",
  default: defaultLoading,
  //@ts-ignore
  effects_UNSTABLE: [loading.initialize]
});
