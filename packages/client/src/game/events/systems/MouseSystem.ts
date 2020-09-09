import System from "@/game/events/systems/System";
import EventSystem from "@/game/events/EventSystem";
import Deps from "@/game/events/Deps";

interface MouseEvent {
  id: number;
  down: boolean;
  x: number;
  y: number;
}

export default class MouseSystem extends System<MouseEvent> {
  private _state: Record<number, boolean> = {};

  constructor(eventSystem: EventSystem) {
    super(eventSystem, MouseSystem.name);
  }
  
  initialize({ input, camera }: Deps): void {
    input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
      this._state[pointer.id] = true;
      this.trigger({ id: pointer.id, down: true, x, y }, MouseSystem);
    });
  
    input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
      this.trigger({ id: pointer.id, down: this._state[pointer.id] ?? false, x, y }, MouseSystem);
    });
  
    input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      const { x, y } = pointer.positionToCamera(camera) as Phaser.Math.Vector2;
      this._state[pointer.id] = false;
      this.trigger({ id: pointer.id, down: false, x, y }, MouseSystem);
    })
  }
}