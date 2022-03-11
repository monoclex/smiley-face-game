import { MutableVariable } from "@/util/MutableVariable";
import { chatOpen, gameFocusGlobal } from "../state";

export const signOpen = new MutableVariable(false);

export default function inputEnabled() {
  return !(chatOpen.value || gameFocusGlobal.state.settingsOpen || signOpen.value);
}
