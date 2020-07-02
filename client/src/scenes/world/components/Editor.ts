import { Block } from '../../../libcore/core/models/Block';
import { TileId } from "../../../libcore/core/models/TileId";
import { swapLayer, TileLayer } from "../../../libcore/core/models/TileLayer";
import { bresenhamsLine } from "../../../misc";
import { WorldScene } from "../WorldScene";

export function sampleBlock(mapData: Block[][][], x: number, y: number, shiftHeld?: boolean): { id: TileId, layer: TileLayer } {
  const foregroundSample = sampleAt(TileLayer.Foreground);
  if (foregroundSample) return foregroundSample;

  const actionSample = sampleAt(TileLayer.Action);
  if (actionSample) return actionSample;

  const backgroundSample = sampleAt(TileLayer.Background);
  if (backgroundSample) return backgroundSample;

  return { id: TileId.Empty, layer: shiftHeld ? TileLayer.Background : TileLayer.Foreground };

  function sampleAt(layer: TileLayer) {
    const id: TileId = mapData[layer][y][x].id;
    return id !== TileId.Empty
      ? { id, layer }
      : undefined;
  }
}

/**
 * Maintains only the components required for editing
 */
export class Editor {

  private _activeBlock: TileId;
  private _activeLayer: TileLayer;
  private _selectedLayer: TileLayer;
  private _isDown: boolean;
  private _lastX: number;
  private _lastY: number;

  private get tileState() { return this.worldScene._worldBlocks; }
  private get mapData() { return this.worldScene.mapData; }
  private get selectedBlock() { return this.worldScene.selectedBlock; }
  private set selectedBlock(value: TileId) { this.worldScene.selectedBlock = value; }
  private get shiftKey() { return this.worldScene.shiftKey; }
  private get camera() { return this.worldScene.cameras.main; }
  private get networkClient() { return this.worldScene.networkClient; }

  constructor(readonly worldScene: WorldScene) {
    this._selectedLayer = TileLayer.Foreground;

    this.networkClient.events.onBlockSingle = (packet) => {
      this.tileState.placeBlock(packet.layer, packet.position, packet.id);
    };

    worldScene.input.on('pointerdown', this.onPointerDown.bind(this));
    worldScene.input.on('pointerup', this.resetPlacingState.bind(this));
  }

  onPointerDown(pointer: Phaser.Input.Pointer) {
    // if the player has a gun, prevent editing
    if (this.worldScene.mainPlayer.hasGun && this.worldScene.mainPlayer.gun.equipped) {
      this.resetPlacingState();
      return;
    }

    const { x, y } = this.tileState.screenToWorldPosition(pointer.positionToCamera(this.camera) as Phaser.Math.Vector2);

    if (pointer.middleButtonDown()) {
      // pick the block to use for building
      const { id, layer } = sampleBlock(this.mapData, x, y, this.shiftKey.isDown());
      this.selectedBlock = id;
      this._selectedLayer = layer;
    }
    
    if (pointer.rightButtonDown()) {
      // we want to clear blocks if right is down
      const { layer } = sampleBlock(this.mapData, x, y, this.shiftKey.isDown());
      
      this._activeLayer = layer;
      this._activeBlock = TileId.Empty;
    }
    else {
      this._activeLayer = this._selectedLayer;
      this._activeBlock = this.selectedBlock;
    }

    this._isDown = true;
    this._lastX = x;
    this._lastY = y;
  }

  /** @private */
  resetPlacingState() {
    // reset some values just so maybe bugs can be spotted easier if something goes wrong
    this._isDown = false;
    this._lastX = -1;
    this._lastY = -1;
  }

  update(pointer: Phaser.Input.Pointer) {
    // anti gun check here too
    if (this.worldScene.mainPlayer.hasGun && this.worldScene.mainPlayer.gun.equipped) {
      this.resetPlacingState();
      return;
    }

    if (!this._isDown || pointer.middleButtonDown()) return;

    const { x, y } = this.tileState.screenToWorldPosition(pointer.positionToCamera(this.camera) as Phaser.Math.Vector2);

    const tileLayer = this.shiftKey.isDown() ? swapLayer(this._activeLayer) : this._activeLayer;

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