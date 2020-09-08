import HookRegistration from "./events/hooks/HookRegistration";
import Player from "./player/Player";
import EventSystem from "./events/EventSystem";

export default function registerMainPlayerGunDirectionUpdater(
  eventSystem: EventSystem,
  player: Player,
  input: Phaser.Input.InputPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
) {
  const MainPlayerGunDirectionUpdater: HookRegistration = ({ phaser }) => {
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