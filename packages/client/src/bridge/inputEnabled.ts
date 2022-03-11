import { MutableVariable } from "@/util/MutableVariable";
import { gameFocusGlobal } from "../state";

export const signOpen = new MutableVariable(false);

export default function inputEnabled() {
  return !(gameFocusGlobal.state.chatOpen || gameFocusGlobal.state.settingsOpen || signOpen.value);
}
