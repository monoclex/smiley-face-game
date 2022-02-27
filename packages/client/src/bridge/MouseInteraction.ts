import { Container, Sprite } from "pixi.js";
import { TileLayer } from "@smiley-face-game/api/types";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import AuthoredBlockPlacer from "./AuthoredBlockPlacer";
import textures from "./textures";
import { Game } from "@smiley-face-game/api";
import inputEnabled from "./inputEnabled";
import clamp from "@smiley-face-game/api/physics/clamp";
import { selectedBlockState } from "../state";
import { Player } from "@smiley-face-game/api/physics/Player";

enum MouseState {
  None,
  Place,
  Erase,
  // these are left here so that `handleClick`'s legacy code makes more sense
  // WasPlacingNowErasing,
  // WasErasingNowPlacing,
}

export default class MouseInteraction {
  readonly selection: Sprite = new Sprite(textures.get("select"));
  readonly blockChanged: Sprite = new Sprite(textures.get("empty"));
  private mousePos = Vector.Zero;
  private state: MouseState = MouseState.None;
  private lastPlacePos: Vector | undefined;
  private layerSample: TileLayer | undefined;
  mouseInGame = true;

  constructor(
    private readonly root: Container,
    private readonly authoredBlockPlacer: AuthoredBlockPlacer,
    private readonly game: Game,
    private readonly editingPlayer: Player,
    gameElement: HTMLElement
  ) {
    this.blockChanged.visible = false;

    document.addEventListener("mousemove", (event) => {
      this.mousePos = new Vector(event.clientX, event.clientY);
    });

    document.addEventListener("mousedown", this.handleClick.bind(this));
    document.addEventListener("mouseup", this.handleClick.bind(this));

    gameElement.addEventListener("mouseover", () => (this.mouseInGame = true));
    gameElement.addEventListener("mouseleave", () => (this.mouseInGame = false));
  }

  triggerBlockChange(texture: string) {
    if (texture === "empty") {
      this.blockChanged.visible = false;
      return;
    }

    this.blockChanged.texture = textures.get(texture);
    this.blockChanged.visible = true;
    this.blockChanged.width = 32;
    this.blockChanged.height = 32;
    this.blockChanged.alpha = 0.4;
  }

  enable(shouldShow: boolean) {
    this.selection.visible = shouldShow;
  }

  handleClick(event: MouseEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const MOUSE_PRIMARY = 1;
    const MOUSE_SECONDARY = 2;

    const doPlace = (event.buttons & MOUSE_PRIMARY) != 0;
    const doErase = (event.buttons & MOUSE_SECONDARY) != 0;

    // GOAL: we want the player to be able to mash left and right buttons
    // and have it feel really nice. this is a chart detailing the possibilities

    // THE FOLLOWING TABLE WAS MADE BY PLUGGING IN VALUES INTO THE FOLLOWING ALGORITHM:
    //
    // switch (this.state) {
    //   case MouseState.None:
    //     // this is a rare edge case, just set it to sommething
    //     if (doPlace && doErase) this.state = MouseState.WasErasingNowPlacing;
    //     else if (doPlace) this.state = MouseState.Place;
    //     else if (doErase) this.state = MouseState.Erase;
    //     break;
    //   case MouseState.Place:
    //     if (!doPlace) this.state = doErase ? MouseState.Erase : MouseState.None;
    //     else this.state = doErase ? MouseState.WasPlacingNowErasing : MouseState.Place;
    //     break;
    //   case MouseState.Erase:
    //     if (!doErase) this.state = doPlace ? MouseState.Place : MouseState.None;
    //     else this.state = doPlace ? MouseState.WasErasingNowPlacing : MouseState.Erase;
    //     break;
    //   case MouseState.WasPlacingNowErasing:
    //     if (doPlace) this.state = doErase ? MouseState.WasPlacingNowErasing : MouseState.Place;
    //     else this.state = doErase ? MouseState.Erase : MouseState.None;
    //     break;
    //   case MouseState.WasErasingNowPlacing:
    //     if (doErase) this.state = doPlace ? MouseState.WasErasingNowPlacing : MouseState.Erase;
    //     else this.state = doPlace ? MouseState.Place : MouseState.None;
    //     break;
    // }

    // ┌────────────────────────┬─────────┬─────────┬────────────────────────┬─────────┐
    // │         state          │ doPlace │ doErase │         result         │ action  │
    // ├────────────────────────┼─────────┼─────────┼────────────────────────┼─────────┤
    // │         'None'         │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │         'None'         │  true   │  false  │        'Place'         │ 'place' │
    // │         'None'         │  false  │  true   │        'Erase'         │ 'erase' │
    // │         'None'         │  false  │  false  │         'None'         │  'none' │
    // │        'Place'         │  true   │  true   │ 'WasPlacingNowErasing' │ 'erase' │
    // │        'Place'         │  true   │  false  │        'Place'         │ 'place' │
    // │        'Place'         │  false  │  true   │        'Erase'         │ 'erase' │
    // │        'Place'         │  false  │  false  │         'None'         │  'none' │
    // │        'Erase'         │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │        'Erase'         │  true   │  false  │        'Place'         │ 'place' │
    // │        'Erase'         │  false  │  true   │        'Erase'         │ 'erase' │
    // │        'Erase'         │  false  │  false  │         'None'         │  'none' │
    // │ 'WasPlacingNowErasing' │  true   │  true   │ 'WasPlacingNowErasing' │ 'erase' │
    // │ 'WasPlacingNowErasing' │  true   │  false  │        'Place'         │ 'place' │
    // │ 'WasPlacingNowErasing' │  false  │  true   │        'Erase'         │ 'erase' │
    // │ 'WasPlacingNowErasing' │  false  │  false  │         'None'         │  'none' │
    // │ 'WasErasingNowPlacing' │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │ 'WasErasingNowPlacing' │  true   │  false  │        'Place'         │ 'place' │
    // │ 'WasErasingNowPlacing' │  false  │  true   │        'Erase'         │ 'erase' │
    // │ 'WasErasingNowPlacing' │  false  │  false  │         'None'         │  'none' │
    // └────────────────────────┴─────────┴─────────┴────────────────────────┴─────────┘

    // GUARANTEE #1: `doPlace === false && doErase === false` ALWAYS EQUALS `none`
    if (!doPlace && !doErase) {
      this.state = MouseState.None;
      return;
    }

    // ┌────────────────────────┬─────────┬─────────┬────────────────────────┬─────────┐
    // │         state          │ doPlace │ doErase │         result         │ action  │
    // ├────────────────────────┼─────────┼─────────┼────────────────────────┼─────────┤
    // │         'None'         │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │         'None'         │  true   │  false  │        'Place'         │ 'place' │
    // │        'Place'         │  true   │  false  │        'Place'         │ 'place' │
    // │        'Erase'         │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │        'Erase'         │  true   │  false  │        'Place'         │ 'place' │
    // │ 'WasPlacingNowErasing' │  true   │  false  │        'Place'         │ 'place' │
    // │ 'WasErasingNowPlacing' │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │ 'WasErasingNowPlacing' │  true   │  false  │        'Place'         │ 'place' │
    // │         'None'         │  false  │  true   │        'Erase'         │ 'erase' │
    // │        'Place'         │  true   │  true   │ 'WasPlacingNowErasing' │ 'erase' │
    // │        'Place'         │  false  │  true   │        'Erase'         │ 'erase' │
    // │        'Erase'         │  false  │  true   │        'Erase'         │ 'erase' │
    // │ 'WasPlacingNowErasing' │  true   │  true   │ 'WasPlacingNowErasing' │ 'erase' │
    // │ 'WasPlacingNowErasing' │  false  │  true   │        'Erase'         │ 'erase' │
    // │ 'WasErasingNowPlacing' │  false  │  true   │        'Erase'         │ 'erase' │
    // └────────────────────────┴─────────┴─────────┴────────────────────────┴─────────┘

    // GUARANTEE #2: `doPlace === false && doErase === true` ALWAYS EQUALS `erase`
    // LIKEWISE, `doPlace === true && doErase === false` ALWAYS EQUALS `place`

    if (!doPlace && doErase) {
      this.state = MouseState.Erase;
      return;
    }

    if (doPlace && !doErase) {
      this.state = MouseState.Place;
      return;
    }

    // ┌────────────────────────┬─────────┬─────────┬────────────────────────┬─────────┐
    // │         state          │ doPlace │ doErase │         result         │ action  │
    // ├────────────────────────┼─────────┼─────────┼────────────────────────┼─────────┤
    // │         'None'         │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │        'Erase'         │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │ 'WasErasingNowPlacing' │  true   │  true   │ 'WasErasingNowPlacing' │ 'place' │
    // │        'Place'         │  true   │  true   │ 'WasPlacingNowErasing' │ 'erase' │
    // │ 'WasPlacingNowErasing' │  true   │  true   │ 'WasPlacingNowErasing' │ 'erase' │
    // └────────────────────────┴─────────┴─────────┴────────────────────────┴─────────┘

    // GUARANTEE #3: `this.state === 'none' && doPlace === true && doErase === true` ALWAYS EQUALS `place`

    if (this.state === MouseState.None && doPlace && doErase) {
      this.state = MouseState.Place;
      return;
    }

    // NOW: MAP 'WasPlacingNowErasing' => 'Erase' and MAP 'WasErasingNowPlacing' => 'Place'

    // ┌─────────┬─────────┬─────────┬─────────┐
    // │  state  │ doPlace │ doErase │ action  │
    // ├─────────┼─────────┼─────────┼─────────┤
    // │ 'Erase' │  true   │  true   │ 'place' │
    // │ 'Erase' │  true   │  true   │ 'place' │
    // │ 'Place' │  true   │  true   │ 'erase' │
    // │ 'Place' │  true   │  true   │ 'erase' │
    // └─────────┴─────────┴─────────┴─────────┘

    // GUARANTEE #4: at this point, `(doPlace && doErase) === true` so no need to check

    if (this.state === MouseState.Erase) {
      this.state = MouseState.Place;
    } else {
      this.state = MouseState.Erase;
    }
  }

  draw() {
    this.selection.visible = true;

    if (!inputEnabled() || !this.mouseInGame || !this.authoredBlockPlacer.canEdit) {
      this.selection.visible = false;
      this.blockChanged.visible = false;
      return;
    }

    const mouseWorldX = -this.root.position.x + this.mousePos.x;
    const mouseWorldY = -this.root.position.y + this.mousePos.y;

    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;
    let blockX = Math.floor(mouseWorldX / TILE_WIDTH);
    let blockY = Math.floor(mouseWorldY / TILE_HEIGHT);

    blockX = clamp(blockX, 0, this.game.blocks.size.x - 1);
    blockY = clamp(blockY, 0, this.game.blocks.size.y - 1);

    this.selection.position.x = blockX * TILE_WIDTH;
    this.selection.position.y = blockY * TILE_HEIGHT;

    this.blockChanged.position.x = blockX * TILE_WIDTH;
    this.blockChanged.position.y = blockY * TILE_HEIGHT;

    if (this.state === MouseState.None) {
      this.layerSample = undefined;
      this.lastPlacePos = undefined;
      return;
    }

    const selected = selectedBlockState.it;
    const erase = this.state === MouseState.Erase || selected?.id === 0;
    const action: "place" | "erase" = erase ? "erase" : "place";

    // TODO: figure out layer to erase on
    if (erase && this.layerSample === undefined) {
      this.layerSample = this.game.blocks.layerOfTopmostBlock(blockX, blockY);
    }

    this.authoredBlockPlacer.draw(this.lastPlacePos, blockX, blockY, action, this.layerSample);
    this.lastPlacePos = { x: blockX, y: blockY };
  }
}
