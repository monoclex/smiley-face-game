import { EEPhysics } from "../../physics/ee/EEPhysics";
import { Player } from "../../physics/Player";
import { Rectangle } from "../../physics/Rectangle";
import { ZHeap } from "../../types";
import { ComplexBlockBehavior } from "../register";

export class KeysBehavior implements ComplexBlockBehavior {
  collides(
    world: EEPhysics,
    player: Player,
    id: number,
    heap: ZHeap | 0,
    playerHitbox: Rectangle
  ): boolean {}

  near(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void {}
  far(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void {}

  in(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void {
    world.events.emit("keyTouch", "red", player);
  }

  out(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void {}
}
