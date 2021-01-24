import { gameFocusGlobal } from "../state";

export default function inputEnabled() {
  return !gameFocusGlobal.state.chatOpen && !gameFocusGlobal.state.settingsOpen;
}
