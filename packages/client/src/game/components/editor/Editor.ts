import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Position from "@/math/Position";
import Component from "@/game/components/Component";
import World from "@/game/world/World";
import EditorDisplay from "./EditorDisplay";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import BlockBar from "../../blockbar/BlockBar";
import iteratePointers from "@/game/iteratePointers";

// we'll have a map of active pointers so that if the user is on mobile and draws multiple lines, we can safely calculate the distances
// for all the blocks simultaneously.
class DrawingPointer {
  lastPosition: Position;
  lastLayer?: TileLayer;

  constructor(
    readonly pointer: Phaser.Input.Pointer,
    readonly editor: Editor,
    readonly blockBar: BlockBar,
  ) {
    this.lastPosition = this.position(pointer);
  }

  onDown() {
    if (!this.editor.enabled) return;
    const { id } = this.id();
    this.lastLayer = undefined;

    // if we're placing an empty block, try to pick a block at that position
    if (id === TileId.Empty) {
      // TODO: depend on the world for this picking behaviour"?
      let { x, y } = this.lastPosition;
      let fg = this.editor.world.foreground.display.tilemapLayer.getTileAt(x, y);
      let action = this.editor.world.action.display.tilemapLayer.getTileAt(x, y);
      let bg = this.editor.world.background.display.tilemapLayer.getTileAt(x, y);

      if (fg) {
        this.lastLayer = TileLayer.Foreground;
      }
      else if (action) {
        this.lastLayer = TileLayer.Action;
      }
      else if (bg) {
        this.lastLayer = TileLayer.Background;
      }
      else {
        // by default, try to erase stuff on the foregrounnd
        // TODO: start erasing stuff as soon as a block is picked on the right layer?
        this.lastLayer = TileLayer.Foreground;
      }
    }

    this.editor.world.drawLine(this.lastPosition, this.lastPosition, this.id(), true, this.lastLayer);
  }

  onMove() {
    if (!this.editor.enabled) return;
    const currentPosition = this.position(this.pointer);
    this.editor.world.drawLine(this.lastPosition, currentPosition, this.id(), true, this.lastLayer);
    this.lastPosition = currentPosition;
  }

  onUp() {
  }

  id() {
    if (this.pointer.rightButtonDown()) return { id: TileId.Empty };
    else return this.blockBar.selectedBlock;
  }

  position(pointer: Phaser.Input.Pointer): Position {
    const { x, y } = pointer.positionToCamera(this.editor.mainCamera) as Phaser.Math.Vector2;
    return this.editor.world.tileManager.tilemap.worldToTileXY(x, y);
  }
}

export default class Editor implements Component {
  readonly display: EditorDisplay;
  readonly drawingPointers: Map<number, DrawingPointer>;
  readonly mainCamera: Phaser.Cameras.Scene2D.Camera;

  private _enabled: boolean = false;
  get enabled(): boolean { return this._enabled; }

  constructor(
    readonly scene: Phaser.Scene,
    readonly world: World,
    readonly blockBar: BlockBar,
  ) {
    this.display = new EditorDisplay();
    this.drawingPointers = new Map();
    this.mainCamera = scene.cameras.main;
    scene.events.on("update", this.update, this);

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const drawingPointer = new DrawingPointer(pointer, this, blockBar);
      this.drawingPointers.set(pointer.pointerId, drawingPointer);
      drawingPointer.onDown();
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const drawingPointer = this.drawingPointers.get(pointer.pointerId);
      if (drawingPointer) {
        drawingPointer.onMove();
      }
    });

    scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      const drawingPointer = this.drawingPointers.get(pointer.pointerId);
      if (drawingPointer) {
        drawingPointer.onUp();
        this.drawingPointers.delete(pointer.pointerId);
      }
    });

    // we set enabled here to run the code responsible for setting up the pointers and whatnot
    this.setEnabled(true);
  }

  update() {
    for (const pointer of this.drawingPointers.values()) {
      if (this._enabled) {
        pointer.onMove();
      }
    }
  }
  
  setEnabled(status: boolean) {
    if (status === this._enabled) return;
    this._enabled = status;

    if (this.enabled) {
      // if we enabled this component, we want to start re-tracking every pointer that was down
      for (const pointer of iteratePointers(this.scene.input)) {

        // if the pointer is down, we want to begin tracking it again
        if (!pointer.isDown) continue;

        const drawingPointer = new DrawingPointer(pointer, this, this.blockBar);
        this.drawingPointers.set(pointer.pointerId, drawingPointer);
        drawingPointer.onDown();
      }
    }
    else {
      // if we disabled this component, we want to stop drawing completely
      const keys = Array.from(this.drawingPointers.keys());

      for (const key of keys) {
        const drawingPointer = this.drawingPointers.get(key)!;
        drawingPointer.onUp();
        this.drawingPointers.delete(key);
      }
    }
  }
}
