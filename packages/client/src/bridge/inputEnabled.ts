import { gameFocusGlobal } from "../state";
import { signGlobal } from "../state/signDialog";

export default function inputEnabled() {
  return (
    !gameFocusGlobal.state.chatOpen && !gameFocusGlobal.state.settingsOpen && !signGlobal.state.open
  );
}
