import { Connection } from "@smiley-face-game/api";
import { Inputs } from "@smiley-face-game/api/game/Inputs";
import { Player } from "@smiley-face-game/api/physics/Player";
import { loadControls } from "../controls";
import { blockInspectorGlobal } from "../state/blockInspector";
import inputEnabled from "./inputEnabled";

function toggle<M, K extends keyof M, V extends M[K]>(inputs: M, key: K, pressed: V): boolean {
  const didChange = inputs[key] !== pressed;
  inputs[key] = pressed;
  return didChange;
}

export default class Keyboard {
  readonly controls = loadControls();

  constructor(readonly player: Player, readonly connection: Connection) {
    const keyDown = (event: KeyboardEvent) => {
      if (!this.connection.connected) {
        document.removeEventListener("keydown", keyDown);
        return;
      }

      const key = event.key.toLowerCase();
      this.handleKey(key, true);
    };

    const keyUp = (event: KeyboardEvent) => {
      if (!this.connection.connected) {
        document.removeEventListener("keyup", keyUp);
        return;
      }

      const key = event.key.toLowerCase();
      this.handleKey(key, false);
    };

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
  }

  simulateKey(key: string, down: boolean) {
    this.handleKey(key.toLowerCase(), down);
  }

  toggle(key: keyof Inputs, pressed: boolean) {
    return toggle(this.player.input, key, pressed);
  }

  handleKey(key: string, pressed: boolean) {
    if (!inputEnabled()) return;

    let didChange = false;

    switch (key) {
      case "arrowup":
      case this.controls.up.binding:
        didChange = this.toggle("up", pressed);
        break;
      case "arrowright":
      case this.controls.right.binding:
        didChange = this.toggle("right", pressed);
        break;
      case "arrowleft":
      case this.controls.left.binding:
        didChange = this.toggle("left", pressed);
        break;
      case "arrowdown":
      case this.controls.down.binding:
        didChange = this.toggle("down", pressed);
        break;
      case this.controls.jump.binding: // space
        didChange = this.toggle("jump", pressed);
        break;
      case "g":
      case this.controls.god.binding:
        if (pressed && this.player.canGod) {
          this.triggerGod();
        }
        break;
      case this.controls.inspect.binding:
        if (pressed) {
          blockInspectorGlobal.modify({ enabled: !blockInspectorGlobal.state.enabled });
        }
        break;
      // case "e":
      //   if (pressed && player.hasGun) {
      //     player.holdGun(!player.isGunHeld);
      //   }
      //   break;
    }

    if (didChange) {
      this.connection.move(
        this.player.position,
        this.player.velocity,
        this.player.input,
        this.player.queue
      );
    }
  }

  triggerGod() {
    if (!this.player.canGod) {
      console.warn("called `triggerGod` when player can't god");
      console.trace();
    }

    this.player.toggleGodMode();
    this.connection.toggleGod(this.player.isInGodMode);
  }
}
