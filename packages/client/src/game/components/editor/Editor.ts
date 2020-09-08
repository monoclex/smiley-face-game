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

  constructor(
    readonly pointer: Phaser.Input.Pointer,
    readonly editor: Editor,
    readonly blockBar: BlockBar,
  ) {
    this.lastPosition = this.position(pointer);
  }

  onDown() {
    this.editor.world.drawLine(this.lastPosition, this.lastPosition, this.id());
    //
  }

  onMove() {
    const currentPosition = this.position(this.pointer);
    this.editor.world.drawLine(this.lastPosition, currentPosition, this.id());
    //
    this.lastPosition = currentPosition;
  }

  onUp() {
  }

  id() {
    if (this.pointer.rightButtonDown()) return TileId.Empty;
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

  private _enabled: boolean = true;
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
  }

  update() {
    for (const pointer of this.drawingPointers.values()) {
      pointer.onMove();
    }
  }
  
  setEnabled(status: boolean) {
    this._enabled = status;

    if (!this.enabled) {
      // if we enabled this component, we want to start re-tracking every pointer that was down
      for (const pointer of iteratePointers(this.scene.input)) {
        if (!pointer.isDown) continue;

        // if the pointer is down, we want to begin tracking it again
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
