import { TileLayer, ZHeap, ZHeaps, ZWorldBlocks } from "../types";
import { Vector } from "../physics/Vector";
import { bresenhamsLine } from "../misc";
import TileRegistration from "../tiles/TileRegistration";
import { createNanoEvents } from "../nanoevents";
import { WorldLayer } from "./WorldLayer";
import equal from "fast-deep-equal";
import { Rectangle } from "../physics/Rectangle";
import { ZBlockLine, ZBlockSingle, ZSBlockLine, ZSBlockSingle } from "../packets";

interface BlockEvents {
  load(blocks: ZWorldBlocks, heaps: ZHeaps): void;
  block(layer: TileLayer, position: Vector, blockId: number, playerId: number): void;
}

export class Blocks {
  state: WorldLayer<number> = new WorldLayer(0);
  heap: WorldLayer<ZHeap | 0> = new WorldLayer(0);

  /** @deprecated Use `this.state` */
  get ids(): WorldLayer<number> {
    return this.state;
  }
  /** @deprecated Use `this.size.x` */
  get width(): number {
    return this.size.x;
  }
  /** @deprecated Use `this.size.y` */
  get height(): number {
    return this.size.y;
  }

  readonly events = createNanoEvents<BlockEvents>();
  readonly bounds: Rectangle;

  constructor(
    readonly tiles: TileRegistration,
    blocks: ZWorldBlocks,
    heaps: ZHeaps,
    readonly size: Vector
  ) {
    this.bounds = new Rectangle(Vector.Zero, this.size);
    this.load(blocks, heaps);
  }

  load(blocks: ZWorldBlocks, heaps: ZHeaps) {
    this.state.state = blocks;
    this.heap.state = heaps;
    this.emitLoad();
  }

  emitLoad() {
    this.events.emit("load", this.state.state, this.heap.state);
  }

  clear() {
    const state = Blocks.emptyWorld(this.size);
    Blocks.placeBorder(state, this.tiles, this.size);
    this.load(state, []);
  }

  handleLine(packet: ZBlockLine, playerId: number): boolean;
  handleLine(packet: ZSBlockLine): boolean;

  handleLine(packet: ZBlockLine | ZSBlockLine, playerId?: number): boolean {
    playerId = "playerId" in packet ? packet.playerId : playerId;
    if (playerId == null) throw new Error("Unknown player id");

    return this.placeLine(
      packet.layer,
      packet.start,
      packet.end,
      packet.block,
      playerId,
      packet.heap
    );
  }

  placeLine(
    argLayer: TileLayer | null | undefined,
    start: Vector,
    end: Vector,
    blockId: number,
    playerId: number,
    heap?: ZHeap | null | undefined
  ): boolean {
    const layer = argLayer ?? this.tiles.forId(blockId).preferredLayer;
    let didModify = false;

    bresenhamsLine(start.x, start.y, end.x, end.y, (x, y) => {
      const placed = this.placeSingle(layer, { x, y }, blockId, playerId, heap);
      didModify ||= placed;
    });

    return didModify;
  }

  handleSingle(packet: ZSBlockSingle): boolean;
  handleSingle(packet: ZBlockSingle, playerId: number): boolean;

  handleSingle(packet: ZBlockSingle | ZSBlockSingle, playerId?: number): boolean {
    playerId = "playerId" in packet ? packet.playerId : playerId;
    if (playerId == null) throw new Error("Unknown player id");

    return this.placeSingle(packet.layer, packet.position, packet.block, playerId, packet.heap);
  }

  placeSingle(
    argLayer: TileLayer | null | undefined,
    position: Vector,
    blockId: number,
    playerId: number,
    heap?: ZHeap | null | undefined
  ): boolean {
    const layer = argLayer ?? this.tiles.forId(blockId).preferredLayer;
    if (position.x < 0 || position.y < 0) return false;
    if (position.x >= this.size.x || position.y >= this.size.y) return false;

    const value = this.state.get(layer, position.x, position.y);
    const existingHeap = this.heap.get(layer, position.x, position.y);
    if (value === blockId && equal(heap ?? 0, existingHeap)) return false;

    this.state.set(layer, position.x, position.y, blockId);
    if (heap !== null && heap !== undefined) {
      this.heap.set(layer, position.x, position.y, heap);
    }

    this.events.emit("block", layer, position, blockId, playerId);
    return true;
  }

  blockAt({ x, y }: Vector, tileLayer: TileLayer): number {
    return this.state.get(tileLayer, x, y);
  }

  layerOfTopmostBlock(x: number, y: number) {
    if (this.state.get(TileLayer.Decoration, x, y) !== 0) return TileLayer.Decoration;
    for (let layer = TileLayer.Foreground; layer <= TileLayer.Background; layer++) {
      if (this.state.get(layer, x, y) !== 0) return layer;
    }
    return undefined;
  }

  private static emptyWorld(size: Vector): number[][][] {
    const state = [];

    for (let idxLayer = TileLayer.Foreground; idxLayer <= TileLayer.Decoration; idxLayer++) {
      const layer = Blocks.makeLayer(size, 0);
      state[idxLayer] = layer;
    }

    return state;
  }

  private static placeBorder(state: number[][][], tileJson: TileRegistration, size: Vector) {
    const layer = state[TileLayer.Foreground];
    const block = tileJson.id("basic-white");

    const top = layer[0];
    const bottom = layer[size.y - 1];

    for (let x = 0; x < size.x; x++) {
      top[x] = bottom[x] = block;
    }

    const rightEndOfWorld = size.x - 1;
    for (let idxY = 1; idxY < size.y - 2; idxY++) {
      const y = layer[idxY];
      y[0] = y[rightEndOfWorld] = block;
    }
  }

  static makeLayer<T = 0>(size: Vector, value: T): T[][] {
    const layer = [];
    for (let idxY = 0; idxY < size.y; idxY++) {
      const y = Blocks.makeYs(size, value);
      layer[idxY] = y;
    }
    return layer;
  }

  static makeYs<T>(size: Vector, value: T): T[] {
    const y = [];
    for (let idxX = 0; idxX < size.x; idxX++) {
      y[idxX] = value;
    }
    return y;
  }
}
