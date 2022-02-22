import { ZKeyKind } from "../../types";
import { EEPhysics } from "./EEPhysics";

export class Keys {
  private readonly state: Partial<Record<ZKeyKind, number>> = {};

  constructor(private readonly physics: EEPhysics) {}

  isOn(key: ZKeyKind) {
    const ticksOffAt = this.state[key];

    if (!ticksOffAt) return false;
    return this.physics.ticks < ticksOffAt;
  }

  toggleOnUntil(key: ZKeyKind, ticks: number) {
    this.state[key] = ticks;
  }
}
