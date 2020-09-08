import HookRegistration from "./events/hooks/HookRegistration";
import Player from "./player/Player";
import EventSystem from "./events/EventSystem";

export default function registerEditorInput(
  eventSystem: EventSystem,
  player: Player,
) {
  const EditorInput: HookRegistration = ({ mouse }) => {
    mouse.register(({ event }) => {
      if (!player.canEdit) return "pass";

      

      return "pass";
    }, true);
  }

  eventSystem.registerHook(EditorInput);
}