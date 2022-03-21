import { EEPhysics } from "../../physics/EEPhysics";
import { Player } from "../../physics/Player";
import { Rectangle } from "../../physics/Rectangle";
import { ZKeyKind } from "../../types";
import { solidHitbox } from "../hitboxes";
import { ComplexBlockBehavior } from "../register";

export class KeyDoorGateBehavior implements ComplexBlockBehavior {
  constructor(private readonly kind: ZKeyKind, private readonly isGate: boolean) {}

  getCollision(world: EEPhysics, player: Player): boolean {
    return world.keyIsOnForPlayer(player, this.kind);
  }

  collides(world: EEPhysics, player: Player, _1: any, _2: any, playerHitbox: Rectangle): boolean {
    const keyIsOn = this.getCollision(world, player);

    const willCollide = this.isGate ? keyIsOn : !keyIsOn;
    if (willCollide) {
      return Rectangle.overlaps(playerHitbox, solidHitbox);
    }

    return false;
  }

  near(world: EEPhysics, player: Player): void {
    const numIn = player.keys.getCountIn(this.kind);
    const collision = this.getCollision(world, player);

    player.keys.setCollision(this.kind, collision);
    player.keys.setCountIn(this.kind, numIn + 1);

    if (numIn === 0) {
      world.events.emit("playerKeyState", this.kind, player, collision);
    }
  }

  far(world: EEPhysics, player: Player): void {
    player.keys.setCountIn(this.kind, player.keys.getCountIn(this.kind) - 1);

    if (player.keys.getCountIn(this.kind) === 0) {
      player.keys.removeCollision(this.kind);
      world.events.emit("playerKeyState", this.kind, player, this.getCollision(world, player));
    }
  }

  in(): void {}
  out(): void {}
}

export class KeyBehavior implements ComplexBlockBehavior {
  constructor(private readonly kind: ZKeyKind) {}

  collides(): boolean {
    return false;
  }

  near(): void {}
  far(): void {}

  in(world: EEPhysics, player: Player): void {
    world.events.emit("keyTouch", this.kind, player);
    world.keys.trigger(this.kind, world.ticks + 7000, player);
  }

  out(): void {}
}
