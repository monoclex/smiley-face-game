import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Position from "@/math/Position";
import Component from "@/game/components/Component";
import World from "@/game/tiles/World";
import EditorDisplay from "./EditorDisplay";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";

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
    this.editor.world.drawLine(this.lastPosition, this.lastPosition, TileId.Full);
  }

  onMove() {
    const currentPosition = this.position(this.pointer);
    this.editor.world.drawLine(this.lastPosition, currentPosition, this.id());
    this.lastPosition = currentPosition;
  }

  onUp() {
  }

  id() {
    if (this.pointer.rightButtonDown()) return TileId.Empty;
    else return TileId.Full;
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
  readonly world: World;

  constructor(scene: Phaser.Scene, world: World) {
    this.display = new EditorDisplay();
    this.drawingPointers = new Map();
    this.mainCamera = scene.cameras.main;
    this.world = world;
    scene.events.on("update", this.update, this);

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const drawingPointer = new DrawingPointer(pointer, this);
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
}
