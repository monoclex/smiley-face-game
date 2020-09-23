import { atom } from "recoil";
import { LoadingScene } from "@/scenes/loading/LoadingScene";

export interface LoadingState {
  failed: boolean;
  why?: string;
}

export const loadingState = atom<LoadingState>({
  key: "loadingState",
  default: {
    failed: false,
  },
  //@ts-ignore
  effects_UNSTABLE: [({ setSelf, onSet }) => {
    onSet((value) => {
      window.recoil.loading.state = value;
    })
    
    window.recoil.loading.setState = setSelf;
  }]
});

// initialize global state for recoil so we don't get lots of errors
if (!window.recoil) window.recoil = {};
if (!window.recoil.loading) window.recoil.loading = {};

// TODO: hardcoding the default here until i figure out how to get the RecoilStore currently in use,
// and then get the current state of the atom from that
window.recoil.loading.state = { failed: false };
