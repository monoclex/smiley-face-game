import { toClientTileId } from '../../../client/toClientTileId';
import { TileId } from "../../../libcore/core/models/TileId";
import { TileLayer } from "../../../libcore/core/models/TileLayer";
import { TILE_HEIGHT, TILE_WIDTH } from '../Config';
import { WorldScene } from '../WorldScene';

interface TileLayers {
  readonly void: Phaser.GameObjects.TileSprite;
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

    // void is just the empty tile repeating
    // TODO: figure out how to make 'atlas' not default to tile `0`, as the implicit requirement may be bad
    const tilingVoidSprite = worldScene.add.tileSprite(0, 0, tilemap.widthInPixels, tilemap.heightInPixels, 'atlas');
    tilingVoidSprite.setPosition(tilemap.widthInPixels / 2, tilemap.heightInPixels / 2);

    const layers = {
      void: tilingVoidSprite,
      background: createDynamicTilemap('background'),
      action: createDynamicTilemap('action'),
      foreground: createDynamicTilemap('foreground'),
    };

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
    const collisionTiles = [];

    // we'll shove all the blocks into the world, and then recalculate everything once we're done
    {
      const layer = TileLayer.Background;
      const mapLayer = this.mapData[layer];
      const tileLayer = this.getTilemapLayer(layer);

      for (let y = 0; y < this.height; y++) {
        const mapY = mapLayer[y];

        for (let x = 0; x < this.width; x++) {
          const blockId = mapY[x].id;
          if (blockId === TileId.Empty) continue;
          
          tileLayer.putTileAt(blockId, x, y, false);
        }
      }
    }
    
    {
      const layer = TileLayer.Action;
      const mapLayer = this.mapData[layer];
      const tileLayer = this.getTilemapLayer(layer);

      for (let y = 0; y < this.height; y++) {
        const mapY = mapLayer[y];

        for (let x = 0; x < this.width; x++) {
          const blockId = mapY[x].id;
          if (blockId === TileId.Empty) continue;
          
          tileLayer.putTileAt(blockId, x, y, false);

          this._addTileCollisionEvent(blockId, tileLayer, x, y);
        }
      }
    }

    {
      let layer = TileLayer.Foreground;
      const mapLayer = this.mapData[layer];
      const tileLayer = this.getTilemapLayer(layer);

      for (let y = 0; y < this.height; y++) {
        const mapY = mapLayer[y];
        const yTimesWidth = y * this.width;

        for (let x = 0; x < this.width; x++) {
          const blockId = mapY[x].id;
          if (blockId === TileId.Empty) continue;

          tileLayer.putTileAt(blockId, x, y, true);

          const tileIndex = yTimesWidth + x;
          collisionTiles.push(tileIndex);
        }
      }
    }

    const tilemapLayer = this.getTilemapLayer(TileLayer.Foreground);
    tilemapLayer.setCollision(collisionTiles, true, true, true);

    // now that we've shoved all the data in, process it
    this.world.convertTilemapLayer(_layers.foreground);

    console.timeEnd('init');
  }

  outlineRectangle(layer: TileLayer, position: Position, size: Size, tileId: TileId = TileId.Full): Position[] {
    let positions = this.fillBlocks(layer, position, { ...size, height: 1 }, tileId);
    positions = positions.concat(this.fillBlocks(layer, position, { ...size, width: 1 }, tileId));
    positions = positions.concat(this.fillBlocks(layer, { ...position, x: size.width + position.x - 1 }, { ...size, width: 1 }, tileId));
    positions = positions.concat(this.fillBlocks(layer, { ...position, y: size.height + position.y - 1 }, { ...size, height: 1 }, tileId));
    return positions;
  }

  placeBlock(layer: TileLayer, position: Position, tileId: TileId = TileId.Full): Position[] {
    return this.fillBlocks(layer, position, { width: 1, height: 1 }, tileId);
  }

  screenToWorldPosition(position: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    const { x, y } = position;
    return this._layers.foreground.worldToTileXY(x, y);
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

  public fillBlocks(
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
    y = clamp(y, 3, this.height);

    // clamp the end positions to be inside the world too
    endX = clamp(endX, 0, this.width);
    endY = clamp(endY, 3, this.height);

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
    for (const position of positions) {
      this._addTileCollisionEvent(tileId, tileLayer, position.x, position.y);
    }
  }

  private _addTileCollisionEvent(tileId: TileId, tileLayer: Phaser.Tilemaps.DynamicTilemapLayer, x: number, y: number) {
    if (tileId !== TileId.Gun) return;
    
    const gunSensor = this.matter.add.rectangle(
      x * TILE_WIDTH + (TILE_WIDTH / 2), y * TILE_HEIGHT + (TILE_HEIGHT / 2),
      TILE_WIDTH, TILE_HEIGHT,
      { isSensor: true, isStatic: true },
    );

    //@ts-ignore
    this.matterCollision.addOnCollideStart({
      objectA: gunSensor,
      callback: ({ bodyB }: { bodyB: MatterJS.BodyType }) => {
        if (this.onGunCollide) {
          this.onGunCollide(tileId, { x, y }, bodyB);
        }
      },
      context: this,
    })

    //@ts-ignore
    this.worldScene.mapData[TileLayer.Action][y][x].sensor = gunSensor;
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
