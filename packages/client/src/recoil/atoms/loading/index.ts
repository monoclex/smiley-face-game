import { atom } from "recoil";
import SharedGlobal from "@/recoil/SharedGlobal";

interface StateLoading {
  failed: undefined;
}

interface StateLoadingFailed {
  failed: true;
  why: string;
}

interface StateLoadingSuccess {
  failed: false;
}

export type Loading = StateLoading | StateLoadingFailed | StateLoadingSuccess;

export const defaultLoading: Loading = { failed: undefined };
export const loading = new SharedGlobal<Loading>(defaultLoading);
export const loadingState = atom<Loading>({
  key: "loadingState",
  default: defaultLoading,
  //@ts-ignore
  effects_UNSTABLE: [loading.initialize],
});
