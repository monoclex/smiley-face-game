import Component from "@/game/components/Component";
import GunController from "./GunController";
import GunDisplay from "./GunDisplay";
import Bullet from "@/game/components/bullet/Bullet";
import GunBreed from "./GunBreed";

export default class Gun implements Component {
  readonly display: GunDisplay;

  private _canShoot: boolean = true;
  private _scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, readonly breed: GunBreed, readonly controller: GunController) {
    this._scene = scene;
    this.display = new GunDisplay(scene, "gun");

    this._scene.events.on("update", this.update, this);
  }

  update() {
    if (!this.controller.isHeld) {
      this.display.renderStrappedGun();
    }
    else {
      this.display.renderHeldGun(this.controller.angle);

      if (this.controller.isFiring && this._canShoot) {
        this.fireBullet();
      }
    }
  }

  fireBullet() {
    this._canShoot = false;
    setTimeout(() => this._canShoot = true, this.breed.firingRate);

    // TODO: figure out the math for where the bullet will go
    const bullet = new Bullet(this._scene, {
      bulletType: "bullet",
      position: { x: this.display.sprite.x, y: this.display.sprite.y },
      angle: this.controller.angle,
      lifetime: this.breed.bulletLife,
    });
  }

  destroy() {
    this._scene.events.off("update", this.update, this);
    this.display.sprite.destroy();
  }
}
