import { TileId } from "../../../libcore/core/models/TileId";
import { swapLayer, TileLayer } from "../../../libcore/core/models/TileLayer";
import { bresenhamsLine } from "../../../misc";
import { WorldScene } from "../WorldScene";

/**
 * Maintains only the components required for editing
 */
export class Editor {

  private _activeBlock: TileId;
  private _selectedLayer: TileLayer;
  private _isDown: boolean;
  private _lastX: number;
  private _lastY: number;

  private get tileState() { return this.worldScene._worldBlocks; }
  private get selectedBlock() { return this.worldScene.selectedBlock; }
  private get shiftKey() { return this.worldScene.shiftKey; }
  private get camera() { return this.worldScene.cameras.main; }
  private get networkClient() { return this.worldScene.networkClient; }

  constructor(readonly worldScene: WorldScene) {
    this._activeBlock = this.selectedBlock;

    this.networkClient.events.onBlockSingle = (packet) => {
      console.log(packet);
      this.tileState.placeBlock(packet.layer, packet.position, packet.id);
    };

    worldScene.input.on('pointerdown', ((pointer) => this.onPointerDown(pointer)).bind(this));
    worldScene.input.on('pointerup', this.resetPlacingState.bind(this));
  }

  onPointerDown(pointer: Phaser.Input.Pointer) {
    const { x, y } = this.tileState.screenToWorldPosition(pointer.positionToCamera(this.camera) as Phaser.Math.Vector2);

    if (pointer.rightButtonDown()) {
      // we want to clear blocks if right is down
      this._activeBlock = TileId.Empty
    }
    else {
      this._activeBlock = this.selectedBlock;
    }

    this._isDown = true;
    // TODO: need something a bit fancier to be able to deal with action blocks in the future, when we have a block bar
    this._selectedLayer = TileLayer.Foreground;
    this._lastX = x;
    this._lastY = y;
  }

  /** @private */
  resetPlacingState() {
    // reset some values just so maybe bugs can be spotted easier if something goes wrong
    this._isDown = false;
    this._selectedLayer = TileLayer.Background;
    this._lastX = -1;
    this._lastY = -1;
  }

  update(pointer: Phaser.Input.Pointer) {
    if (!this._isDown) return;

    const { x, y } = this.tileState.screenToWorldPosition(pointer.positionToCamera(this.camera) as Phaser.Math.Vector2);

    const tileLayer = this.shiftKey.isDown() ? swapLayer(this._selectedLayer) : this._selectedLayer;

    const absoluteXDiff = Math.abs(this._lastX - x);
    const absoluteYDiff = Math.abs(this._lastY - y);

    let blocksToSend = [];

    // if the block position only changed by 1 block, we don't need to employ any fancy algorithms
    if (absoluteXDiff <= 1 && absoluteYDiff <= 1) {
      blocksToSend = this._placeBlock(tileLayer, { x, y }, this._activeBlock);
    }
    // check if we ended up placing a horizontal/vertical line - we can optimize this scenario
    else if (absoluteXDiff === 0 || absoluteYDiff === 0) { // line
      const start = { x: Math.min(this._lastX, x), y: Math.min(this._lastY, y) };
      const size = { width: absoluteXDiff + 1, height: absoluteYDiff + 1 };
      blocksToSend = this._fillBlocks(tileLayer, start, size, this._activeBlock);
    }
    // otherwise, we need to use a fancy algorithm to properly handle the blocks inbetween the two frames
    else {
      const start = { x: this._lastX, y: this._lastY };
      const end = { x, y };
    
      // some fancy line, use Bresenham's Line Algorithm to fill in these blocks
      bresenhamsLine(start.x, start.y, end.x, end.y, (x, y) => {
        blocksToSend = blocksToSend.concat(this._placeBlock(tileLayer, { x, y }, this._activeBlock));
      });
    }

    this._lastX = x;
    this._lastY = y;

    for (const block of blocksToSend) {
      this.networkClient.placeBlock(block.x, block.y, this.tileState.blockAt(tileLayer, block), tileLayer);
    }
  }

  /** @private */
  _placeBlock(layer: TileLayer, position, selectedBlock: TileId) {
    return this.tileState.placeBlock(layer, position, selectedBlock);
  }

  /** @private */
  _fillBlocks(layer: TileLayer, start, size, selectedBlock: TileId) {
    return this.tileState.fillBlocks(layer, start, size, selectedBlock);
  }
}