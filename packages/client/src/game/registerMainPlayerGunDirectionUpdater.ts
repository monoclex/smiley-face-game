/**
 * @description This event hook will orient the player's gun to be facing the mouse cursor on every frame tick.
 */

import EventHook from "./events/EventHook";
import Player from "./player/Player";
import EventSystem from "./events/EventSystem";

export default function registerMainPlayerGunDirectionUpdater(
  eventSystem: EventSystem,
  player: Player,
  input: Phaser.Input.InputPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
) {
  const MainPlayerGunDirectionUpdater: EventHook = ({ phaser }) => {
    phaser.register(() => {
      if (player.hasGun) {
        const { x, y } = input.activePointer.positionToCamera(camera) as Phaser.Math.Vector2
        player.getGun().setLookingAt(x, y);
      }

      return "pass";
    }, true);
  }

  eventSystem.registerHook(MainPlayerGunDirectionUpdater);
}