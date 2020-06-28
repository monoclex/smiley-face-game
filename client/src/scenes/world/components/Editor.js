import { swapLayer } from "../../../libcore/core/models/TileLayer";
import { WorldBlocks } from "./WorldBlocks";
import { bresenhamsLine } from "../../../misc";
import { NetworkClient } from "../../../networking/NetworkClient";
import { TileId } from "../../../libcore/core/models/TileId";
import { TileLayer } from "../../../libcore/core/models/TileLayer";

/**
 * Maintains only the components required for editing
 */
export class Editor {
  /**
   * @private
   * @param {WorldBlocks} tileState
   * @param {NetworkClient} networkClient
   */
  constructor(tileState, input, camera, shiftKey, networkClient) {
    this._tileState = tileState;
    this.selectedBlock = TileId.Full;
    this._shift = shiftKey;
    this._camera = camera;
    this._networkClient = networkClient;
    this._networkClient.events.onBlockSingle = (packet, sender) => {
      console.log(packet);
      this._tileState.placeBlock(packet.layer, packet.position, packet.id);
    };

    input.on('pointerdown', ((pointer) => this.onPointerDown(pointer)).bind(this));
    input.on('pointerup', this.resetPlacingState.bind(this));
  }

  /**
   * @private
   * @param {Phaser.Input.Pointer} pointer
   */
  onPointerDown(pointer) {
    const { x, y } = this._tileState.screenToWorldPosition(pointer.positionToCamera(this._camera));

    if (pointer.rightButtonDown()) {
      // we want to clear blocks if right is down
      this.selectedBlock = TileId.Empty
    }
    else {
      // TODO: have a way to reset selected block or something fancier, this is just a temporary hack
      this.selectedBlock = TileId.Full;
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

  /**
   * @param {Phaser.Input.Pointer} pointer
   */
  update(pointer) {
    if (!this._isDown) return;

    const { x, y } = this._tileState.screenToWorldPosition(pointer.positionToCamera(this._camera));

    const tileLayer = this._shift.isDown() ? swapLayer(this._selectedLayer) : this._selectedLayer;

    const absoluteXDiff = Math.abs(this._lastX - x);
    const absoluteYDiff = Math.abs(this._lastY - y);

    let blocksToSend = [];

    // if the block position only changed by 1 block, we don't need to employ any fancy algorithms
    if (absoluteXDiff <= 1 && absoluteYDiff <= 1) {
      blocksToSend = this._placeBlock(tileLayer, { x, y }, this.selectedBlock);
    }
    // check if we ended up placing a horizontal/vertical line - we can optimize this scenario
    else if (absoluteXDiff === 0 || absoluteYDiff === 0) { // line
      const start = { x: Math.min(this._lastX, x), y: Math.min(this._lastY, y) };
      const size = { width: absoluteXDiff + 1, height: absoluteYDiff + 1 };
      blocksToSend = this._fillBlocks(tileLayer, start, size, this.selectedBlock);
    }
    // otherwise, we need to use a fancy algorithm to properly handle the blocks inbetween the two frames
    else {
      const start = { x: this._lastX, y: this._lastY };
      const end = { x, y };
    
      // some fancy line, use Bresenham's Line Algorithm to fill in these blocks
      bresenhamsLine(start.x, start.y, end.x, end.y, (x, y) => {
        blocksToSend = blocksToSend.concat(this._placeBlock(tileLayer, { x, y }, this.selectedBlock));
      });
    }

    this._lastX = x;
    this._lastY = y;

    for (const block of blocksToSend) {
      this._networkClient.placeBlock(block.x, block.y, this._tileState.blockAt(tileLayer, block), tileLayer);
    }
  }

  /** @private */
  _placeBlock(layer, position, selectedBlock) {
    return this._tileState.placeBlock(layer, position, selectedBlock);
  }

  /** @private */
  _fillBlocks(layer, start, size, selectedBlock) {
    return this._tileState.fillBlocks(layer, start, size, selectedBlock);
  }
}