/**
 * @description This file is responsible for receiving input from the mouse, and then sending the right packets if the user should be drawing
 * blocks on the world.
 */

 // god have mercy

import EventHook from "./events/EventHook";
import Player from "./player/Player";
import EventSystem from "./events/EventSystem";
import NetworkSystem from "./events/systems/NetworkSystem";
import { bresenhamsLine } from "@smiley-face-game/api/misc";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import { TileId } from "@smiley-face-game/api/schemas/TileId";

interface UserEditorState {
  id: TileId
}

class PointerState {
  down: boolean = false;
  lastX?: number;
  lastY?: number;

  constructor(
    readonly network: NetworkSystem,
    readonly state: UserEditorState,
  ) {}

  handle(down: boolean, x: number, y: number) {
    if (!down) {
      this.lastX = undefined;
      this.lastY = undefined;
      return;
    }

    if (!this.lastX || !this.lastY) {
      this.network.trigger({
        packetId: "BLOCK_SINGLE",
        position: { x, y },
        layer: TileLayer.Foreground,
        id: this.state.id,
      });
    }
    else {
      this.network.trigger({
        packetId: "BLOCK_LINE",
        start: { x: this.lastX, y: this.lastY },
        end: { x, y },
        layer: TileLayer.Foreground,
        id: this.state.id,
      });
    }

    this.lastX = x;
    this.lastY = y;
  }
}

export default function registerEditorInput(
  eventSystem: EventSystem,
  player: Player,
) {
  let pointers: Record<number, PointerState> = {};
  let userEditorState: UserEditorState = { id: TileId.Full };

  const EditorInput: EventHook = ({ mouse }) => {
    mouse.register(({ network, event: { id, down, x, y } }) => {
      if (!player.canEdit) {
        if (pointers[id] && pointers[id].down) pointers[id].handle(down, x, y);
        return "pass";
      }

      if (!pointers[id]) pointers[id] = new PointerState(network, userEditorState);

      const pointerState = pointers[id];
      pointerState.handle(down, x, y);

      return "pass";
    }, true);
  }

  eventSystem.registerHook(EditorInput);
}