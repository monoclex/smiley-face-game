import { ChatState } from "@/recoil/atoms/chat";
import { LoadingState } from "@/recoil/atoms/loading";

// https://stackoverflow.com/a/12709880/3780113
declare global {
  interface Window {
    recoil: RecoilState
  }
}

interface RecoilState {
  chat: ChatRecoilState;
  loading: LoadingRecoilState;
}

interface ChatRecoilState {
  state?: ChatState;
  setState?: (newState: ChatState) => void;
}

interface LoadingRecoilState {
  state?: LoadingState;
  setState?: (newState: LoadingState) => void;
}