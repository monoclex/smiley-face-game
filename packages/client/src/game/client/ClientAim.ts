import { Container } from "pixi.js";
import Bullets from "../Bullets";
import ClientPlayer from "./ClientPlayer";

const A_SECOND = 1000;
const TEN_TIMES = 10;

export default class ClientAim {
  x = 0;
  y = 0;
  shootInterval: number | undefined;

  onShoot?: (angle: number) => void;

  private mousemove: (ev: MouseEvent) => void;
  private mousedown: () => void;
  private mouseup: () => void;

  constructor(private readonly root: Container, private readonly player: ClientPlayer, bullets: Bullets) {
    this.mousemove = (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
    };

    this.mousedown = () => {
      // `"mousedown"` may get fired more than once, so if we're already firing do nothing
      // otherwise we'll create 2 intervals, one which will never get cleared (credit: @Seb135#7528)
      if (this.shootInterval) return;

      // https://stackoverflow.com/a/55157673/3780113
      this.shootInterval = window.setInterval(() => {
        if (!player.isGunHeld) return;

        const angle = this.calcAngle();
        bullets.spawn(this.player, angle);

        if (this.onShoot) {
          this.onShoot(angle);
        }
      }, A_SECOND / TEN_TIMES);
    };

    this.mouseup = () => {
      clearInterval(this.shootInterval);
      this.shootInterval = undefined;
    };

    document.addEventListener("mousemove", this.mousemove);
    document.addEventListener("mousedown", this.mousedown);
    document.addEventListener("mouseup", this.mouseup);
  }

  private calcAngle(): number {
    const offsetX = -this.root.position.x;
    const offsetY = -this.root.position.y;
    const x = this.x + offsetX;
    const y = this.y + offsetY;

    // https://github.com/photonstorm/phaser/blob/v3.50.0/src/math/angle/Between.js
    return Math.atan2(y - this.player.center.y, x - this.player.center.x);
  }

  tick() {
    this.player.gunAngle = this.calcAngle();
  }

  cleanup() {
    if (this.shootInterval) {
      clearInterval(this.shootInterval);
    }

    document.removeEventListener("mousemove", this.mousemove);
    document.removeEventListener("mousedown", this.mousedown);
    document.removeEventListener("mouseup", this.mouseup);
  }
}
