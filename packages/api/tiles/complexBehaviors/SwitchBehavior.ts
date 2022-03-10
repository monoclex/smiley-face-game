import { EEPhysics } from "../../physics/EEPhysics";
import { Player } from "../../physics/Player";
import { Rectangle } from "../../physics/Rectangle";
import { ZHeap } from "../../types";
import { solidHitbox } from "../hitboxes";
import { ComplexBlockBehavior } from "../register";

export class SwitchDoorGateBehavior implements ComplexBlockBehavior {
  constructor(private readonly isGate: boolean) {}

  getCollision(player: Player, heap: ZHeap | 0): boolean {
    if (heap === 0 || heap.kind !== "switch") return false;
    const switchId = heap.id;

    const playerCollision = player.switches.getCollision(switchId);
    if (typeof playerCollision !== "undefined") return playerCollision;
    return player.switches.isOn(switchId);
  }

  collides(
    world: EEPhysics,
    player: Player,
    _: any,
    heap: ZHeap | 0,
    playerHitbox: Rectangle
  ): boolean {
    const isOn = this.getCollision(player, heap);

    const willCollide = this.isGate ? isOn : !isOn;
    if (willCollide) {
      return Rectangle.overlaps(playerHitbox, solidHitbox);
    }

    return false;
  }

  near(world: EEPhysics, player: Player, _: any, heap: ZHeap | 0): void {
    if (heap === 0 || heap.kind !== "switch") return;
    const switchId = heap.id;

    const numIn = player.switches.getCountIn(switchId);
    const collision = this.getCollision(player, heap);

    player.switches.setCollision(switchId, collision);
    player.switches.setCountIn(switchId, numIn + 1);

    if (numIn === 0) {
      world.events.emit("switchStateChanged", player, switchId, collision);
    }
  }

  far(world: EEPhysics, player: Player, _: any, heap: ZHeap | 0): void {
    if (heap === 0 || heap.kind !== "switch") return;
    const switchId = heap.id;

    player.switches.setCountIn(switchId, player.switches.getCountIn(switchId) - 1);

    if (player.switches.getCountIn(switchId) === 0) {
      player.switches.removeCollision(switchId);
      world.events.emit("switchStateChanged", player, switchId, this.getCollision(player, heap));
    }
  }

  in(): void {}
  out(): void {}
}

export class SwitchButtonBehavior implements ComplexBlockBehavior {
  constructor() {}

  collides(): boolean {
    return false;
  }

  near(): void {}
  far(): void {}

  in(world: EEPhysics, player: Player, _: any, heap: ZHeap | 0): void {
    if (heap === 0 || heap.kind !== "switch") return;
    const switchId = heap.id;

    const previousState = player.switches.isOn(switchId);
    const nowState = !previousState;
    player.switches.toggle(switchId, nowState);

    world.events.emit("touchSwitch", player, switchId, previousState);
    world.events.emit("switchStateChanged", player, switchId, nowState);
  }

  out(): void {}
}
