import GunModel from "@/game/guns/models/GunModel";
import Player from "./Player";
import World from "../world/World";
import { Character } from "../characters/Character";
import GameScene from "../GameScene";
import M249LMG from "@/game/guns/models/variants/M249LMG";

export default class PlayerManager {
  readonly players: Map<number, Player> = new Map();

  constructor(
    readonly game: GameScene
  ) {}

  getPlayer(id: number): Player {
    const player = this.players.get(id);

    if (player === undefined) {
      console.warn("Attempt to retreive player", id, "is undefined.");
      throw new Error("Undefined player id " + id);
    }

    return player;
  }

  addPlayer(id: number, username: string, playerContainer: Phaser.GameObjects.Container): Player {
    const player = new Player(this.game, new Character(this.game, username));
    this.players.set(id, player);
    player.character.addToContainer(playerContainer);
    return player;
  }

  removePlayer(playerId: number) {
    this.players.delete(playerId);
  }

  onEquipGun(playerId: number, equipped: boolean) {
    const player = this.getPlayer(playerId);

    if (!player.gun) {
      console.warn("attempted to equip gun on a player that does not have a gun");
      return;
    }

    player.gun.equipped = equipped;
  }

  onFireBullet(playerId: number) {
    // TODO: implement
    this.getPlayer(playerId).getGun();
  }

  onPickupGun(playerId: number) {
    // TODO: allow the pickup gun packet to specify what type of gun
    this.getPlayer(playerId).instantiateGun(M249LMG);
  }
}