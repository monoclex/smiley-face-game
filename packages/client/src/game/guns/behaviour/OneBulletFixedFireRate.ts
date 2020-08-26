import GameScene from "@/game/GameScene";
import GunBehaviour from "@/game/guns/behaviour/GunBehaviour";

// https://en.wikipedia.org/wiki/M249_light_machine_gun
export default class OneBulletFixedFireRate extends GunBehaviour {
  constructor(
    readonly game: GameScene,
    readonly player: Phaser.GameObjects.Sprite,
    readonly gun: Phaser.GameObjects.Sprite,
    readonly fireRate: number, // how many ms per bullet
  ) {
    super(player, gun);
    this.game.events.on("update", this.update, this);
  }

  _lastFire: number = -10000.0; // lol
  firing: boolean = false;

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (!this.firing) return;
    if (time - this._lastFire < this.fireRate) return;
    
    this._lastFire = time;
    
    // TODO: spawn bullet
    console.log('pew');
  }

  destroy() {
    this.game.events.off("update", this.update, this);
    this.gun.destroy();
  }
}
