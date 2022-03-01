import { createNanoEvents } from "../nanoevents";
import { ZSInit, ZSPlayerJoin, ZSRoleUpdate } from "../packets";
import { Player } from "../physics/Player";
import { ZRole } from "../types";

interface PlayerEvents {
  add(player: Player): void;
  remove(player: Player): void;
  roleUpdate(player: Player, before: ZRole): void;
  updateCanGod(player: Player, before: boolean): void;
}

export class Players {
  readonly map: Map<number, Player> = new Map();
  readonly events = createNanoEvents<PlayerEvents>();

  _list: Player[] = [];
  get list(): Player[] {
    return this._list;
  }

  constructor(init?: ZSInit) {
    if (init) {
      for (const player of init.players) {
        this.add(player);
      }
    }
  }

  get(id: number): Player {
    const player = this.map.get(id);

    if (!player) throw new Error("Unable to get player " + id);
    return player;
  }

  // TODO: rename `handleEvent`
  add(event: ZSPlayerJoin): Player {
    const player = new Player(
      event.playerId,
      event.username,
      event.role,
      event.isGuest,
      event.joinLocation,
      event.canGod,
      event.inGod
    );
    return this.addPlayer(player);
  }

  addPlayer(player: Player): Player {
    this.map.set(player.id, player);
    this._list = Array.from(this.map.values());
    this.events.emit("add", player);
    return player;
  }

  remove(id: number) {
    const player = this.get(id);
    this.map.delete(id);
    this._list = Array.from(this.map.values());
    this.events.emit("remove", player);
  }

  updatePerms(event: ZSRoleUpdate): 0 {
    switch (event.permission) {
      case "ROLE":
        this.updateRole(event.playerId, event.newRole);
        return 0;
      case "GOD":
        this.updateCanGod(event.playerId, event.canGod);
        return 0;
    }
  }

  // TODO: turn these two into instance methods,
  //   and have new players get handle to `events`
  updateRole(playerId: number, newRole: ZRole) {
    const player = this.get(playerId);
    const previousRole = player.role;
    player.role = newRole;
    this.events.emit("roleUpdate", player, previousRole);
  }

  updateCanGod(playerId: number, newCanGod: boolean) {
    const player = this.get(playerId);
    const before = player.canGod;
    player.canGod = newCanGod;

    if (!newCanGod) {
      player.isInGodMode = false;
    }

    this.events.emit("updateCanGod", player, before);
  }
}
