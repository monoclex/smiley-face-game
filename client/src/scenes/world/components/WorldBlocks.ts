import { toClientTileId } from '../../../client/toClientTileId';
import { TileId } from "../../../libcore/core/models/TileId";
import { TileLayer } from "../../../libcore/core/models/TileLayer";
import { TILE_HEIGHT, TILE_WIDTH } from '../Config';
import { WorldScene } from '../WorldScene';

interface TileLayers {
  readonly void: Phaser.Tilemaps.DynamicTilemapLayer;
  readonly background: Phaser.Tilemaps.DynamicTilemapLayer;
  readonly action: Phaser.Tilemaps.DynamicTilemapLayer;
  readonly foreground: Phaser.Tilemaps.DynamicTilemapLayer;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type ActionCollisionEvent = (tileId: TileId, position: Position, bodyB: MatterJS.BodyType) => void;

/**
 * Class for maintaining only the block state of a world.
 */
export class WorldBlocks {
  static create(worldScene: WorldScene): WorldBlocks {

    const { worldSize, tilemap, tileset } = worldScene;
    const { world } = worldScene.matter;
    const { width, height } = worldSize;

    const createDynamicTilemap = (name: string) => tilemap.createBlankDynamicLayer(name, tileset, 0, 0, width, height, TILE_WIDTH, TILE_HEIGHT);

    const layers = {
      void: createDynamicTilemap('void'),
      background: createDynamicTilemap('background'),
      action: createDynamicTilemap('action'),
      foreground: createDynamicTilemap('foreground'),
    };
    
    // fill the void with void tiles
    const row = new Array<number>(width).fill(/* TileId.Void */ 0)
    const data = new Array<number[]>(height).fill(row); // fill number[] with *references* to an array of void blocks
    layers.void.putTilesAt(data, 0, 0);

    // prevent people from falling out of the world
    world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    return new WorldBlocks(layers, worldScene);
  }

  onGunCollide?: ActionCollisionEvent;

  private get width() { return this.worldScene.worldSize.width; }
  private get height() { return this.worldScene.worldSize.height; }
  private get mapData() { return this.worldScene.mapData; }
  private get matter() { return this.worldScene.matter; }
  private get world() { return this.matter.world; }
  // @ts-ignore
  private get matterCollision(): any { return this.worldScene.matterCollision; }

  constructor(
    private readonly _layers: TileLayers,
    readonly worldScene: WorldScene, 
  ) {

    // we'll shove all the blocks into the world, and then recalculate everything once we're done
    for (let layer = 0; layer <= TileLayer.Background; layer++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const blockId = this.mapData[layer][y][x].id;

          const clientTileId = toClientTileId(blockId);
          const tileLayer = this.getTilemapLayer(layer);
          
          tileLayer.putTilesAt([clientTileId], x, y, true);

          const tileIndex = y * this.width + x;

          if (layer === TileLayer.Foreground) {
            tileLayer.setCollision(tileIndex, true, true, true);
          }

          this._addTileCollisionEvents(blockId, tileLayer, [{ x, y }]);
        }
      }
    }

    // now that we've shoved all the data in, process it
    this.world.convertTilemapLayer(_layers.foreground);
  }

  outlineRectangle(layer: TileLayer, position: Position, size: Size, tileId: TileId = TileId.Full): Position[] {
    let positions = this.fillBlocks(layer, position, { ...size, height: 1 }, tileId);
    positions = positions.concat(this.fillBlocks(layer, position, { ...size, width: 1 }, tileId));
    positions = positions.concat(this.fillBlocks(layer, { ...position, x: size.width + position.x - 1 }, { ...size, width: 1 }, tileId));
    positions = positions.concat(this.fillBlocks(layer, { ...position, y: size.height + position.y - 1 }, { ...size, height: 1 }, tileId));
    return positions;
  }

  fillBlocks(layer: TileLayer, position: Position, size: Size, tileId: TileId = TileId.Full): Position[] {
    return this._fillBlocks(layer, position, size, tileId);
  }

  placeBlock(layer: TileLayer, position: Position, tileId: TileId = TileId.Full): Position[] {
    return this.fillBlocks(layer, position, { width: 1, height: 1 }, tileId);
  }

  screenToWorldPosition(position: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const { x, y } = position;
    return this._layers.void.worldToTileXY(x, y);
  }

  blockAt(layer: TileLayer, position: Position): TileId {
    return this.mapData[layer][position.y][position.x].id;
  }

  private getTilemapLayer(layer: TileLayer): Phaser.Tilemaps.DynamicTilemapLayer {
    const map = {
      [TileLayer.Foreground]: this._layers.foreground,
      [TileLayer.Action]: this._layers.action,
      [TileLayer.Background]: this._layers.background,
    };

    return map[layer];
  }

  private _fillBlocks(
    layer: TileLayer,
    position: Position,
    size: Size,
    tileId: TileId,
  ): Position[] {
    const shouldCollide = false;
    let { x, y } = position;
    let { width, height } = size;
    let endX = x + width;
    let endY = y + height;

    // we're going to clamp the position to be inside of the world
    x = clamp(x, 0, this.width);
    y = clamp(y, 0, this.height);

    // clamp the end positions to be inside the world too
    endX = clamp(endX, 0, this.width);
    endY = clamp(endY, 0, this.height);

    // recalculate the size from clamped positions
    width = endX - x;
    height = endY - y;

    const tileLayer = this.getTilemapLayer(layer);
    const clientTileId = toClientTileId(tileId);

    let changed = [];

    let tileIds = [];
    for (let posY = y; posY < endY; posY++) {
      for (let posX = x; posX < endX; posX++) {

        // only trigger changes for blocks that need to be changed
        if (this.mapData[layer][posY][posX].id !== tileId) {
          tileLayer.putTileAt(clientTileId, posX, posY, false);
          tileIds.push(posY * height + posX);

          changed.push({ x: posX, y: posY });

          // TODO: place chaning logic in its own place?
          const block = this.mapData[layer][posY][posX];
          if (block.sensor) {
            this.world.remove(block.sensor);
          }

          block.id = tileId;
        }
      }
    }

    tileLayer.setCollision(tileIds, shouldCollide, false, false);

    this._addTileCollisionEvents(tileId, tileLayer, changed);

    // TODO: clean this up, not entirely sure what i'm doing but it WORKS so i'm committing it so it can be cleaned later
    if (tileId !== TileId.Empty) {
      // when we get the tile data, we want to get the tiles a little bit outside of it so that the tiles we care about get their collision
      // polygons correct so the player doesn't trip over ghost collisions or anything
      const tileData = tileLayer.getTilesWithin(x - 1, y - 1, width + 2, height + 2, { isColliding: true });
      this.world.convertTiles(tileData);
      // @ts-ignore
      this.world.processEdges(tileLayer, tileData);
    }
    else {
    
      // destroy all the physics bodies of the tile being deleted and the tiles around it
      const tilesAround = tileLayer.getTilesWithin(x - 1, y - 1, width + 2, height + 2);
      
      for (const tile of tilesAround) {
        //@ts-ignore
        if (tile.physics.matterBody) tile.physics.matterBody.destroy();

        // delete the tile and then put it back
        const copy = { ...tile };
        tile.destroy();

        tileLayer.putTileAt(copy.index, copy.x, copy.y);
      }
      
      // re-create the physics bodies of the collidable tiles around and smoothen them out
      const collidableTiles = tileLayer.getTilesWithin(x - 1, y - 1, width + 2, height + 2, { isColliding: true });
      this.world.convertTiles(collidableTiles);
      //@ts-ignore
      this.world.processEdges(tileLayer, collidableTiles);
    }

    return changed;
  }

  private _addTileCollisionEvents(tileId: TileId, tileLayer: Phaser.Tilemaps.DynamicTilemapLayer, positions: Position[]) {
    if (tileId !== TileId.Gun) return;
    
    for (const position of positions) {
      const gunSensor = this.matter.add.rectangle(
        position.x * TILE_WIDTH + (TILE_WIDTH / 2), position.y * TILE_HEIGHT + (TILE_HEIGHT / 2),
        TILE_WIDTH, TILE_HEIGHT,
        { isSensor: true, isStatic: true },
      );

      //@ts-ignore
      this.matterCollision.addOnCollideStart({
        objectA: gunSensor,
        callback: ({ bodyB }: { bodyB: MatterJS.BodyType }) => {
          if (this.onGunCollide) {
            this.onGunCollide(tileId, position, bodyB);
          }
        },
        context: this,
      })

      //@ts-ignore
      this.worldScene.mapData[TileLayer.Action][position.y][position.x].sensor = gunSensor;
    }
  }
}

interface Position {
  readonly x: number;
  readonly y: number;
}

interface Size {
  readonly width: number;
  readonly height: number;
}
