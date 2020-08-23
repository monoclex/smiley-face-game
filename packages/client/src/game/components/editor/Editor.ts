import { TileId } from "@smiley-face-game/api/schemas/TileId";
import Position from "@/math/Position";
import Component from "@/game/components/Component";
import World from "@/game/world/World";
import EditorDisplay from "./EditorDisplay";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import BlockBar from "../../blockbar/BlockBar";

// we'll have a map of active pointers so that if the user is on mobile and draws multiple lines, we can safely calculate the distances
// for all the blocks simultaneously.
class DrawingPointer {
  lastPosition: Position;

  constructor(
    readonly pointer: Phaser.Input.Pointer,
    readonly editor: Editor,
    readonly blockBar: BlockBar,
  ) {
    console.log(blockBar);
    this.lastPosition = this.position(pointer);
  }

  onDown() {
    this.editor.world.drawLine(this.lastPosition, this.lastPosition, this.id());
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
  readonly world: World;

  constructor(scene: Phaser.Scene, world: World, blockBar: BlockBar) {
    this.display = new EditorDisplay();
    this.drawingPointers = new Map();
    this.mainCamera = scene.cameras.main;
    this.world = world;
    scene.events.on("update", this.update, this);
    console.log('blckbar', blockBar);

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      console.log('pd', blockBar);
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
}
