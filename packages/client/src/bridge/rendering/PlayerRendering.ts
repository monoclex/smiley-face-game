import { Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Container, Renderer } from "pixi.js";
import GamePlayer from "../GamePlayer";
import WorldRendering from "./WorldRendering";

export default class PlayerRenderer {
  gamePlayers: Map<number, GamePlayer> = new Map();
  focus!: Player;

  constructor(
    readonly game: Game,
    readonly root: Container,
    readonly renderer: Renderer,
    readonly worldRenderer: WorldRendering
  ) {
    // todo: make this a function lol
    for (const player of game.players.list) {
      const gamePlayer = new GamePlayer();
      this.gamePlayers.set(player.id, gamePlayer);

      this.players.addChild(gamePlayer.container);
    }

    game.players.events.on("add", (player) => {
      const gamePlayer = new GamePlayer();
      this.gamePlayers.set(player.id, gamePlayer);

      this.players.addChild(gamePlayer.container);
    });

    game.players.events.on("remove", (player) => {
      const gamePlayer = this.gamePlayers.get(player.id);
      if (!gamePlayer) throw new Error("impossible player remove");

      const index = this.players.getChildIndex(gamePlayer.container);
      this.players.removeChildAt(index);
    });

    game.physics.events.on("checkpoint", (player, pos) => {
      if (player !== this.focus) return;
      this.worldRenderer.turnOnCheckpoint(pos);
    });
  }

  readonly players: Container = new Container();

  draw(): void {
    // update game containers and stuff from game data
    for (const player of this.game.players.list) {
      const gamePlayer = this.gamePlayers.get(player.id);
      if (!gamePlayer) throw new Error("impossible player id desync");

      gamePlayer.container.x = player.position.x;
      gamePlayer.container.y = player.position.y;

      gamePlayer.wings.visible = player.isInGodMode;

      if (player.isDead) {
        gamePlayer.sprite.tint = 0xff0000;
      } else {
        gamePlayer.sprite.tint = 0xffffff;
      }
    }

    this.updateCameraView();
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
