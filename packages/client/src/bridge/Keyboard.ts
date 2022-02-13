import { Connection } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import inputEnabled from "./inputEnabled";

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

  handleKey(key: string, pressed: boolean) {
    if (!inputEnabled()) return;

    let didChange = false;

    switch (key) {
      case "arrowup":
      case "w":
        didChange = this.player.input.up !== pressed;
        this.player.input.up = pressed;
        break;
      case "arrowright":
      case "d":
        didChange = this.player.input.right !== pressed;
        this.player.input.right = pressed;
        break;
      case "arrowleft":
      case "a":
        didChange = this.player.input.left !== pressed;
        this.player.input.left = pressed;
        break;
      case "arrowdown":
      case "s":
        didChange = this.player.input.down !== pressed;
        this.player.input.down = pressed;
        break;
      case " ": // space
        didChange = this.player.input.jump !== pressed;
        this.player.input.jump = pressed;
        break;
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
