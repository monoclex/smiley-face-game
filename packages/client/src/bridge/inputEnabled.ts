import { MutableVariable } from "@/util/MutableVariable";
import { chatOpen, settingsOpen } from "../state";

export const signOpen = new MutableVariable(false);

export default function inputEnabled() {
  return !(chatOpen.value || settingsOpen.value || signOpen.value);
}
