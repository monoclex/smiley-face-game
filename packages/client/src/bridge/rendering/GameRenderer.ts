import { Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { Container, Renderer } from "pixi.js";
import { createNanoEvents } from "nanoevents";
import GamePlayer from "../GamePlayer";
import PlayerRenderer from "./PlayerRendering";
import WorldRendering from "./WorldRendering";

interface GameRendererEvents {
  draw(): void;
}

export default class GameRenderer {
  gamePlayers: Map<number, GamePlayer> = new Map();

  get focus(): Player {
    return this.playerRenderer.focus;
  }

  set focus(player: Player) {
    this.playerRenderer.focus = player;
  }

  readonly playerRenderer: PlayerRenderer;
  readonly worldRenderer: WorldRendering;
  readonly events = createNanoEvents<GameRendererEvents>();

  constructor(readonly game: Game, readonly renderer: Renderer) {
    this.playerRenderer = new PlayerRenderer(game, this.root, renderer);
    this.worldRenderer = new WorldRendering(game);

    // <-- most behind
    this.root.addChild(this.worldRenderer.worldBehind);
    this.root.addChild(this.playerRenderer.players);
    // this.root.addChild(this.bullets);
    this.root.addChild(this.worldRenderer.worldInfront);
    // selection gets added here too (in `ClientSelector`)
    // <-- closest to viewer
  }

  readonly root: Container = new Container();
  readonly bullets: Container = new Container();
  private mouse: Vector = Vector.Zero;

  draw(): void {
    this.playerRenderer.draw();
    this.worldRenderer.draw();
    this.events.emit("draw");

    this.renderer.render(this.root);
  }
}