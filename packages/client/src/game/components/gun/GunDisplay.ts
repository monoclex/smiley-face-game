import urlGun from "@/assets/held_gun.png";
import ComponentDisplay from "@/game/components/ComponentDisplay";
import GunType from "./GunType";

function key(gunType: GunType): string {
  return "gun-" + gunType;
}

export default class GunDisplay implements ComponentDisplay {
  readonly sprite: Phaser.GameObjects.Sprite;

  static load(loader: Phaser.Loader.LoaderPlugin) {
    loader.image(key("gun"), urlGun);
  }

  constructor(scene: Phaser.Scene, gunType: GunType) {
    this.sprite = scene.add.sprite(0, 0, key(gunType));
  }
  
  get depth() {
    return this.sprite.depth;
  }

  set depth(value) {
    this.sprite.depth = value;
  }

  renderStrappedGun() {
    // place it behind the player and rotate it so it looks like it's carried on the player's back diagonally-ish
    // TODO: use origins
    // this.sprite.setPosition(this.player.sprite.x - 6, this.player.sprite.y - 6);
    this.sprite.setRotation(Math.PI / 3.5);
    this.sprite.setFlipX(false);
  }

  renderHeldGun(angle: number) {
    
  }
}