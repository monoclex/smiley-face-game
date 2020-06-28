import { toClientTileId } from '../../../client/toClientTileId';
import { TileId } from "../../../libcore/core/models/TileId";
import { TileLayer } from "../../../libcore/core/models/TileLayer";
import { TILE_HEIGHT, TILE_WIDTH, WorldConfig } from '../Config';

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
  static create(
    tilemap: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
    world: Phaser.Physics.Matter.World,
    config: WorldConfig
  ): WorldBlocks {

    const createDynamicTilemap = (name: string) => {
      const { width, height } = config;
      return tilemap.createBlankDynamicLayer(name, tileset, 0, 0, width, height, TILE_WIDTH, TILE_HEIGHT);
    }

    const layers = {
      void: createDynamicTilemap('void'),
      background: createDynamicTilemap('background'),
      action: createDynamicTilemap('action'),
      foreground: createDynamicTilemap('foreground'),
    };
    
    // fill the void with void tiles
    const row = new Array<number>(config.width).fill(/* TileId.Void */ 0)
    const data = new Array<number[]>(config.height).fill(row); // fill number[] with *references* to an array of void blocks
    layers.void.putTilesAt(data, 0, 0);

    // prevent people from falling out of the world
    world.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);

    const tileState = new WorldBlocks(layers, world, config);

    return tileState;
  }

  private readonly _map: WorldConfig;
  onGunCollide?: ActionCollisionEvent;

  constructor(
    private readonly _layers: TileLayers,
    private readonly _world: Phaser.Physics.Matter.World,
    private readonly _worldState: WorldConfig,
  ) {
    this._map = _worldState;
    
    // we'll shove all the blocks into the world, and then recalculate everything once we're done
    for (let layer = 0; layer <= TileLayer.Background; layer++) {
      for (let y = 0; y < this._map.height; y++) {
        for (let x = 0; x < this._map.width; x++) {
          const blockId = this._map.blocks[layer][y][x];

          const clientTileId = toClientTileId(blockId);
          const tileLayer = this.getTilemapLayer(layer);
          
          tileLayer.putTilesAt([clientTileId], x, y, true);

          const tileIndex = y * this._map.width + x;

          if (layer === TileLayer.Foreground) {
            tileLayer.setCollision(tileIndex, true, true, true);
          }

          this._addTileCollisionEvents(blockId, tileLayer, [{ x, y }]);
        }
      }
    }

    // now that we've shoved all the data in, process it
    _world.convertTilemapLayer(_layers.foreground);
  }

  outlineRectangle(layer: TileLayer, position: Position, size: Size, tileId: TileId = TileId.Full): Position[] {
    let positions = this.fillBlocks(layer, position, { ...size, height: 1 }, tileId);
    positions = positions.concat(this.fillBlocks(layer, position, { ...size, width: 1 }, tileId));
    positions = positions.concat(this.fillBlocks(layer, { ...position, x: size.width + position.x - 1 }, { ...size, width: 1 }, tileId));
    positions = positions.concat(this.fillBlocks(layer, { ...position, y: size.height + position.y - 1 }, { ...size, height: 1 }, tileId));
    return positions;
  }

  fillBlocks(layer: TileLayer, position: Position, size: Size, tileId: TileId = TileId.Full): Position[] {
    const shouldCollide = layer === TileLayer.Foreground;
    return this._fillBlocks(layer, position, size, tileId, shouldCollide);
  }

  placeBlock(layer: TileLayer, position: Position, tileId: TileId = TileId.Full): Position[] {
    return this.fillBlocks(layer, position, { width: 1, height: 1 }, tileId);
  }

  screenToWorldPosition(position: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const { x, y } = position;
    return this._layers.void.worldToTileXY(x, y);
  }

  blockAt(layer: TileLayer, position: Position): TileId {
    return this._map.blocks[layer][position.y][position.x];
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
    shouldCollide: boolean
  ): Position[] {
    let { x, y } = position;
    let { width, height } = size;
    let endX = x + width;
    let endY = y + height;

    // we're going to clamp the position to be inside of the world
    x = clamp(x, 0, this._worldState.width);
    y = clamp(y, 0, this._worldState.height);

    // clamp the end positions to be inside the world too
    endX = clamp(endX, 0, this._worldState.width);
    endY = clamp(endY, 0, this._worldState.height);

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
        if (this._map.blocks[layer][posY][posX] !== tileId) {
          tileLayer.putTileAt(clientTileId, posX, posY, false);
          tileIds.push(posY * height + posX);

          changed.push({ x: posX, y: posY });
          this._map.blocks[layer][posY][posX] = tileId;
        }
      }
    }

    tileLayer.setCollision(tileIds, shouldCollide, false, false);

    this._addTileCollisionEvents(tileId, tileLayer, changed);

    // when we get the tile data, we want to get the tiles a little bit outside of it so that the tiles we care about get their collision
    // polygons correct so the player doesn't trip over ghost collisions or anything
    const tileData = tileLayer.getTilesWithin(x - 1, y - 1, width + 2, height + 2, { isColliding: true });
    this._world.convertTiles(tileData);
    // @ts-ignore
    this._world.processEdges(tileLayer, tileData);

    return changed;
  }

  private _addTileCollisionEvents(tileId: TileId, tileLayer: Phaser.Tilemaps.DynamicTilemapLayer, positions: Position[]) {
    if (tileId !== TileId.Gun) return;
    
    for (const position of positions) {
      const gunSensor = this._world.scene.matter.add.rectangle(
        position.x * TILE_WIDTH + (TILE_WIDTH / 2), position.y * TILE_HEIGHT + (TILE_HEIGHT / 2),
        TILE_WIDTH, TILE_HEIGHT,
        { isSensor: true, isStatic: true },
      );

      //@ts-ignore
      this._world.scene.matterCollision.addOnCollideStart({
        objectA: gunSensor,
        callback: ({ bodyB }: { bodyB: MatterJS.BodyType }) => {
          if (this.onGunCollide) {
            this.onGunCollide(tileId, position, bodyB);
          }
        },
        context: this,
      })
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
