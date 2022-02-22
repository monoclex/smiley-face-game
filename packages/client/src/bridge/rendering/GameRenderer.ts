import { Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { Container, Renderer } from "pixi.js";
import { createNanoEvents } from "nanoevents";
import GamePlayer from "../GamePlayer";
import PlayerRenderer from "./PlayerRendering";
import WorldRendering from "./WorldRendering";
import SignRendering from "./SignRendering";

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
    this.worldRenderer.self = player;
    this.signRenderer.focus = player;
  }

  readonly playerRenderer: PlayerRenderer;
  readonly worldRenderer: WorldRendering;
  readonly signRenderer: SignRendering;
  readonly events = createNanoEvents<GameRendererEvents>();

  constructor(readonly game: Game, readonly renderer: Renderer) {
    this.worldRenderer = new WorldRendering(game);
    this.signRenderer = new SignRendering(game);
    this.playerRenderer = new PlayerRenderer(game, this.root, renderer, this.worldRenderer);

    // <-- most behind
    this.root.addChild(this.worldRenderer.worldBehind);
    this.root.addChild(this.playerRenderer.players);
    // this.root.addChild(this.bullets);
    this.root.addChild(this.worldRenderer.worldInfront);
    // selection gets added here too (in `ClientSelector`)
    // <-- closest to viewer

    this.root.addChild(this.signRenderer.sprite);
  }

  readonly root: Container = new Container();
  readonly bullets: Container = new Container();
  private mouse: Vector = Vector.Zero;

  draw(): void {
    this.playerRenderer.draw();
    this.worldRenderer.draw();
    this.signRenderer.draw();
    this.events.emit("draw");

    this.renderer.render(this.root);
  }
}
