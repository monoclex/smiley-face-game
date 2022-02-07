import { Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { Container, Renderer } from "pixi.js";
import GamePlayer from "./GamePlayer";

export default class GameRenderer {
  gamePlayers: Map<number, GamePlayer> = new Map();
  focus!: Player;

  constructor(readonly game: Game, readonly renderer: Renderer) {
    // <-- most behind
    this.root.addChild(this.worldBehind);
    this.root.addChild(this.players);
    this.root.addChild(this.bullets);
    this.root.addChild(this.worldInfront);
    // selection gets added here too (in `ClientSelector`)
    // <-- closest to viewer

    game.players.onPlayerAdd = (player) => {
      const gamePlayer = new GamePlayer();
      this.gamePlayers.set(player.id, gamePlayer);

      this.players.addChild(gamePlayer.container);
    };

    game.players.onPlayerRemove = (player) => {
      const gamePlayer = this.gamePlayers.get(player.id);
      if (!gamePlayer) throw new Error("impossible player remove");

      const index = this.players.getChildIndex(gamePlayer.container);
      this.players.removeChildAt(index);
    };
  }

  readonly root: Container = new Container();
  readonly worldBehind: Container = new Container();
  readonly players: Container = new Container();
  readonly bullets: Container = new Container();
  readonly worldInfront: Container = new Container();
  private mouse: Vector = Vector.Zero;

  draw(): void {
    for (const player of this.game.players.list) {
      const gamePlayer = this.gamePlayers.get(player.id);
      if (!gamePlayer) throw new Error("impossible player id desync");

      gamePlayer.container.x = player.position.x;
      gamePlayer.container.y = player.position.y;
    }

    this.updateCameraView();
    this.renderer.render(this.root);
  }

  updateCameraView() {
    // calculate position for player to be in the center
    const HALF_PLAYER_SIZE = 16;
    const centerX = -this.focus.position.x - HALF_PLAYER_SIZE + this.renderer.width / 2;
    const centerY = -this.focus.position.y - HALF_PLAYER_SIZE + this.renderer.height / 2;

    // calc some camera lag
    const CAMERA_LAG_MODIFIER = 1 / 16;
    const cameraLagX = (centerX - this.root.position.x) * CAMERA_LAG_MODIFIER;
    const cameraLagY = (centerY - this.root.position.y) * CAMERA_LAG_MODIFIER;

    // apply the camera lag
    this.root.position.x += cameraLagX;
    this.root.position.y += cameraLagY;
  }
}
