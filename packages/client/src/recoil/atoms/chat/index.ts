import { atom } from "recoil";
import { LoadingScene } from "@/scenes/loading/LoadingScene";

export interface Message {
  id: number;
  timestamp: number;
  username: string;
  content: string;
}

export const messagesState = atom<Message[]>({
  key: "messagesState",
  default: [],
});

export interface ChatState {
  isActive: boolean;
}

export const chatState = atom<ChatState>({
  key: "chatState",
  default: {
    isActive: false,
  },
  //@ts-ignore
  effects_UNSTABLE: [({ setSelf, onSet }) => {
    onSet((value) => {
      window.recoil.chat.state = value;
    })
    
    window.recoil.chat.setState = (newState) => {
      console.log("changing state", newState);
      setSelf(newState);
    };
  }]
});

// initialize global state for recoil so we don't get lots of errors
if (!window.recoil) window.recoil = { chat: {} };

// TODO: hardcoding the default here until i figure out how to get the RecoilStore currently in use,
// and then get the current state of the atom from that
window.recoil.chat.state = { isActive: false };
