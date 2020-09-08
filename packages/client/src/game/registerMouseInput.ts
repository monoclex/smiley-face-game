import HookRegistration from "./events/hooks/HookRegistration";
import Player from "./player/Player";
import EventSystem from "./events/EventSystem";

export default function registerMouseInput(
  eventSystem: EventSystem,
  input: Phaser.Input.InputPlugin,
  camera: Phaser.Cameras.Scene2D.Camera,
) {
  const MouseInput = () => {};

  let state: Record<string, { id: number, down: boolean, x: number, y: number }> = {};

  input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    const { x, y } = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    state[pointer.id] = { id: pointer.id, down: true, x, y };
    eventSystem.mouse.trigger(state[pointer.id], MouseInput);
  });

  input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    const { x, y } = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    state[pointer.id] = { id: pointer.id, down: state[pointer.id]?.down ?? false, x, y };
    eventSystem.mouse.trigger(state[pointer.id], MouseInput);
  });

  input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
    const { x, y } = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
    state[pointer.id] = { id: pointer.id, down: false, x, y };
    eventSystem.mouse.trigger(state[pointer.id], MouseInput);
  })
}