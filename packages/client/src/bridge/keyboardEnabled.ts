import { chat } from "../recoil/atoms/chat";

export default function keyboardEnabled() {
  return !chat.state.isActive;
}
