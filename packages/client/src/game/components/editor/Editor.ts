import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Position from "@/math/Position";
import TileManager from "@/game/tiles/TileManager";
import Component from "@/game/components/Component";
import EditorDisplay from "./EditorDisplay";

// we'll have a map of active pointers so that if the user is on mobile and draws multiple lines, we can safely calculate the distances
// for all the blocks simultaneously.
class DrawingPointer {
  lastPosition: Position;

  constructor(
    readonly pointer: Phaser.Input.Pointer,
    readonly editor: Editor,
  ) {
    this.lastPosition = this.position(pointer);
  }

  onDown() {
    this.editor.tileManager.drawLine(this.lastPosition, this.lastPosition, TileId.Full);
  }

  onMove() {
    const currentPosition = this.position(this.pointer);
    this.editor.tileManager.drawLine(this.lastPosition, currentPosition, TileId.Full);
    this.lastPosition = currentPosition;
  }

  onUp() {
    this.onMove();
  }

  position(pointer: Phaser.Input.Pointer): Position {
    const { x, y } = pointer.positionToCamera(this.editor.mainCamera) as Phaser.Math.Vector2;
    return this.editor.tileManager.tilemap.worldToTileXY(x, y);
  }
}

export default class Editor implements Component {
  readonly display: EditorDisplay;
  readonly drawingPointers: Map<number, DrawingPointer>;
  readonly mainCamera: Phaser.Cameras.Scene2D.Camera;
  readonly tileManager: TileManager;

  constructor(scene: Phaser.Scene, tileManager: TileManager) {
    this.display = new EditorDisplay();
    this.drawingPointers = new Map();
    this.mainCamera = scene.cameras.main;
    this.tileManager = tileManager;

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const drawingPointer = new DrawingPointer(pointer, this);
      this.drawingPointers.set(pointer.pointerId, drawingPointer);
      drawingPointer.onDown();
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.drawingPointers.get(pointer.pointerId)!.onMove();
    });

    scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      this.drawingPointers.get(pointer.pointerId)!.onUp();
      this.drawingPointers.delete(pointer.pointerId);
    });
  }
}
