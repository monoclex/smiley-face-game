import { chatOpen, settingsOpen, signOpen } from "@/state";

export default function inputEnabled() {
  return !(chatOpen.value || settingsOpen.value || signOpen.value);
}
