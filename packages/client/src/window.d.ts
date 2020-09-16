import { ChatState } from "@/recoil/atoms/chat";

// https://stackoverflow.com/a/12709880/3780113
declare global {
  interface Window {
    recoil: RecoilState
  }
}

interface RecoilState {
  chat: ChatRecoilState;
}

interface ChatRecoilState {
  state?: ChatState;
  setState?: (newState: ChatState) => void;
}