import { chat } from "../recoil/atoms/chat";

export default function inputEnabled() {
  return !chat.state.isActive && !chat.state.settingsOpen;
}
