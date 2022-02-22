import { ZKeyKind } from "../types";
import { Player } from "./Player";
import { EEPhysics } from "./EEPhysics";

export class Keys {
  private readonly state: Partial<Record<ZKeyKind, number>> = {};

  constructor(private readonly physics: EEPhysics) {}

  trigger(key: ZKeyKind, onUntil: number, by: Player) {
    const msOnUntil = onUntil - this.physics.start;
    this.toggleOnUntil(key, msOnUntil / this.physics.msPerTick);
  }

  isOn(key: ZKeyKind) {
    const ticksOffAt = this.state[key];

    if (!ticksOffAt) return false;
    return this.physics.ticks < ticksOffAt;
  }

  toggleOnUntil(key: ZKeyKind, ticks: number) {
    this.state[key] = ticks;
  }

  anyJustTurnedOff(): ZKeyKind[] {
    const keys: ZKeyKind[] = [];

    for (const [rawKey, ticksOffAt] of Object.entries(this.state)) {
      const key = rawKey as ZKeyKind;

      if (this.physics.ticks === Math.floor(ticksOffAt)) {
        keys.push(key);
      }
    }

    return keys;
  }
}
