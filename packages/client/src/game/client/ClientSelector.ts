import { Container, Sprite } from "pixi.js";
import World from "../World";
import Position from "../interfaces/Position";
import { TileLayer } from "@smiley-face-game/api/types";
import textures from "../textures";
import AuthoredBlockPlacer from "./AuthoredBlockPlacer";

enum MouseState {
  None,
  Place,
  Erase,
  WasPlacingNowErasing,
  WasErasingNowPlacing,
}

export default class ClientSelector {
  readonly selection: Sprite = new Sprite(textures.select);
  private mousePos: Position = { x: 0, y: 0 };
  private state: MouseState = MouseState.None;
  private lastPlacePos: Position | undefined;
  private layerSample: TileLayer | undefined;

  constructor(
    private readonly root: Container,
    private readonly authoredBlockPlacer: AuthoredBlockPlacer,
    private readonly world: World
  ) {
    // TODO: should we *really* be adding something to the root container?
    root.addChild(this.selection);

    document.addEventListener("mousemove", (event) => {
      this.mousePos.x = event.clientX;
      this.mousePos.y = event.clientY;
    });

    document.addEventListener("mousedown", this.handleClick.bind(this));
    document.addEventListener("mouseup", this.handleClick.bind(this));
  }

  handleClick(event: MouseEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
    const MOUSE_PRIMARY = 1;
    const MOUSE_SECONDARY = 2;

    const doPlace = (event.buttons & MOUSE_PRIMARY) != 0;
    const doErase = (event.buttons & MOUSE_SECONDARY) != 0;

    // TODO: yikers!
    switch (this.state) {
      case MouseState.None:
        // this is a rare edge case, just set it to sommething
        if (doPlace && doErase) this.state = MouseState.WasErasingNowPlacing;
        else if (doPlace) this.state = MouseState.Place;
        else if (doErase) this.state = MouseState.Erase;
        break;
      case MouseState.Place:
        if (!doPlace) this.state = doErase ? MouseState.Erase : MouseState.None;
        else this.state = doErase ? MouseState.WasPlacingNowErasing : MouseState.Place;
        break;
      case MouseState.Erase:
        if (!doErase) this.state = doPlace ? MouseState.Place : MouseState.None;
        else this.state = doPlace ? MouseState.WasErasingNowPlacing : MouseState.Erase;
        break;
      case MouseState.WasPlacingNowErasing:
        if (doPlace) this.state = doErase ? MouseState.WasPlacingNowErasing : MouseState.Place;
        else this.state = doErase ? MouseState.Erase : MouseState.None;
        break;
      case MouseState.WasErasingNowPlacing:
        if (doErase) this.state = doPlace ? MouseState.WasErasingNowPlacing : MouseState.Erase;
        else this.state = doPlace ? MouseState.Place : MouseState.None;
        break;
    }
  }

  tick() {
    const mouseWorldX = -this.root.position.x + this.mousePos.x;
    const mouseWorldY = -this.root.position.y + this.mousePos.y;

    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;
    let blockX = Math.floor(mouseWorldX / TILE_WIDTH);
    let blockY = Math.floor(mouseWorldY / TILE_HEIGHT);

    // TODO: everything below here do be kinda ugly doe
    blockX = blockX < 0 ? 0 : blockX >= this.world.size.width ? this.world.size.width - 1 : blockX;
    blockY = blockY < 0 ? 0 : blockY >= this.world.size.height ? this.world.size.height - 1 : blockY;

    this.selection.position.x = blockX * TILE_WIDTH;
    this.selection.position.y = blockY * TILE_HEIGHT;

    if (this.state === MouseState.Place || this.state === MouseState.WasErasingNowPlacing) {
      this.authoredBlockPlacer.draw(this.lastPlacePos, blockX, blockY, "place");
      this.lastPlacePos = { x: blockX, y: blockY };
    } else if (this.state === MouseState.Erase || this.state === MouseState.WasPlacingNowErasing) {
      // TODO: figure out layer to erase on
      if (this.layerSample === undefined) this.layerSample = this.world.layerOfTopmostBlock(blockX, blockY);
      this.authoredBlockPlacer.draw(this.lastPlacePos, blockX, blockY, "erase", this.layerSample);
      this.lastPlacePos = { x: blockX, y: blockY };
    } else {
      this.layerSample = undefined;
      this.lastPlacePos = undefined;
    }
  }
}
