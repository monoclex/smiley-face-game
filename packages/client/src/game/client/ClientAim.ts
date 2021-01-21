import { Container } from "pixi.js";
import Bullets from "../Bullets";
import ClientPlayer from "./components/ClientPlayer";

const A_SECOND = 1000;
const TEN_TIMES = 10;

export default class ClientAim {
  x: number = 0;
  y: number = 0;
  shootInterval: number | undefined;

  onShoot?: (angle: number) => void;

  constructor(private readonly root: Container, private readonly player: ClientPlayer, bullets: Bullets) {
    document.addEventListener("mousemove", (e) => {
      this.x = e.clientX;
      this.y = e.clientY;
    });

    document.addEventListener("mousedown", () => {
      // `"mousedown"` may get fired more than once, so if we're already firing do nothing
      // otherwise we'll create 2 intervals, one which will never get cleared (credit: @Seb135#7528)
      if (this.shootInterval) return;

      //@ts-ignore this is using node types not DOM types
      this.shootInterval = setInterval(() => {
        if (!player.isGunHeld) return;

        const angle = this.calcAngle();
        bullets.spawn(this.player, angle);

        if (this.onShoot) {
          this.onShoot(angle);
        }
      }, A_SECOND / TEN_TIMES);
    });

    document.addEventListener("mouseup", () => {
      clearInterval(this.shootInterval);
      this.shootInterval = undefined;
    });
  }

  private calcAngle(): number {
    const offsetX = -this.root.position.x;
    const offsetY = -this.root.position.y;
    const x = this.x + offsetX;
    const y = this.y + offsetY;

    // https://github.com/photonstorm/phaser/blob/v3.50.0/src/math/angle/Between.js
    return Math.atan2(y - this.player.position.y, x - this.player.position.x);
  }

  tick() {
    this.player.gunAngle = this.calcAngle();
  }
}
