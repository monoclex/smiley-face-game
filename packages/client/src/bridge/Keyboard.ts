import { Connection } from "@smiley-face-game/api";
import { Inputs } from "@smiley-face-game/api/game/Inputs";
import { Player } from "@smiley-face-game/api/physics/Player";
import inputEnabled from "./inputEnabled";

function toggle<M, K extends keyof M, V extends M[K]>(inputs: M, key: K, pressed: V): boolean {
  const didChange = inputs[key] !== pressed;
  inputs[key] = pressed;
  return didChange;
}

export default class Keyboard {
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
      case "w":
        didChange = this.toggle("up", pressed);
        break;
      case "arrowright":
      case "d":
        didChange = this.toggle("right", pressed);
        break;
      case "arrowleft":
      case "a":
        didChange = this.toggle("left", pressed);
        break;
      case "arrowdown":
      case "s":
        didChange = this.toggle("down", pressed);
        break;
      case " ": // space
        didChange = this.toggle("jump", pressed);
        break;
      case "f":
      case "g":
        if (pressed) {
          this.player.toggleGodMode();
        }
        break;
      // case "e":
      //   if (pressed && player.hasGun) {
      //     player.holdGun(!player.isGunHeld);
      //   }
      //   break;
    }

    if (didChange) {
      this.connection.move(this.player.position, this.player.velocity, this.player.input);
    }
  }
}
