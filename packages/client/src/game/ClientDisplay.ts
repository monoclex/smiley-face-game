import { Container, Renderer } from "pixi.js";
import Game from "./Game";
import Display from "./Display";
import Position from "./Position";

export default class ClientDisplay implements Display {
  readonly root: Container = new Container();
  readonly worldBehind: Container = new Container();
  readonly players: Container = new Container();
  readonly bullets: Container = new Container();
  readonly worldInfront: Container = new Container();
  private mouse: Position = { x: 0, y: 0 };

  constructor(private readonly renderer: Renderer) {
    // <-- most behind
    this.root.addChild(this.worldBehind);
    this.root.addChild(this.players);
    this.root.addChild(this.bullets);
    this.root.addChild(this.worldInfront);
    // selection gets added here too (in `ClientSelector`)
    // <-- closest to viewer
  }

  draw(game: Game): void {
    this.updateCameraView(game);
    this.renderer.render(this.root);
  }

  updateCameraView(game: Game) {
    // calculate position for player to be in the center
    const HALF_PLAYER_SIZE = 16;
    const centerX = -game.self.position.x - HALF_PLAYER_SIZE + this.renderer.width / 2;
    const centerY = -game.self.position.y - HALF_PLAYER_SIZE + this.renderer.height / 2;

    // calc some camera lag
    const CAMERA_LAG_MODIFIER = 1 / 16;
    const cameraLagX = (centerX - this.root.position.x) * CAMERA_LAG_MODIFIER;
    const cameraLagY = (centerY - this.root.position.y) * CAMERA_LAG_MODIFIER;

    // apply the camera lag
    this.root.position.x += cameraLagX;
    this.root.position.y += cameraLagY;
  }
}
