// TODO: clean this file up later

import { bresenhamsLine } from "@smiley-face-game/api/misc";
import type {
  ZBlockSingle,
  ZSBlockSingle,
  ZBlockLine,
  ZSBlockLine,
} from "@smiley-face-game/api/packets";
import Connection from "../../worlds/Connection";
import { ZHeap, ZHeaps, ZWorldBlocks } from "@smiley-face-game/api/types";
import equal from "fast-deep-equal";
import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";

export class BlockHandler {
  ids: WorldLayer<number>;
  heap: WorldLayer<ZHeap | 0>;

  constructor(map: ZWorldBlocks, heaps: ZHeaps, readonly width: number, readonly height: number) {
    this.ids = new WorldLayer(0);
    this.heap = new WorldLayer(0);

    this.ids.state = map;
    this.heap.state = heaps;
  }

  getMap(layer: number, y: number, x: number): number {
    return this.ids.get(layer, x, y);
  }

  handleSingle(packet: ZBlockSingle, sender: Connection): ZSBlockSingle | void {
    const target = this.getMap(packet.layer, packet.position.y, packet.position.x);
    const heap = this.heap.get(packet.layer, packet.position.x, packet.position.y);

    // packet is known good, only do updating work if necessary
    if (packet.block !== target || !equal(packet.heap ?? 0, heap)) {
      // NOTE: if switching to reference types, make sure to copy the value
      this.ids.set(packet.layer, packet.position.x, packet.position.y, packet.block);
      this.heap.set(packet.layer, packet.position.x, packet.position.y, packet.heap ?? 0);

      // only if the packet updated any blocks do we want to queue it
      return {
        ...packet,
        packetId: "SERVER_BLOCK_SINGLE",
        playerId: sender.playerId,
      };
    }
  }

  handleLine(packet: ZBlockLine, sender: Connection): ZSBlockLine | void {
    // for block lines, we *permit* out of bounds values because you can draw a line through them and the blocks that get placed
    // may not be exactly equal if you cap the bounds. so this opts to not do any bounds checking and does individual bounds checking
    // for each block that is placed

    let didUpdate = false;

    // packet is known good, update world
    bresenhamsLine(
      packet.start.x,
      packet.start.y,
      packet.end.x,
      packet.end.y,
      (x: number, y: number) => {
        // TODO: don't do bounds checking (see exploit notice in bresenhamsLine function)
        // bounds checking if the block is within bounds
        if (y < 0 || y >= this.height || x < 0 || x >= this.width) return;

        const block = this.getMap(packet.layer, y, x);
        const heap = this.heap.get(packet.layer, x, y);
        if (block !== packet.block || !equal(packet.heap ?? 0, heap)) {
          didUpdate = true;

          // NOTE: if switching to reference types, make sure to copy value
          this.ids.set(packet.layer, x, y, packet.block);
          this.heap.set(packet.layer, x, y, packet.heap ?? 0);
        }
      }
    );

    // only if the packet updated any blocks do we want to queue it
    if (didUpdate) {
      // packet is known good, schedule it to be handled
      return {
        ...packet,
        packetId: "SERVER_BLOCK_LINE",
        playerId: sender.playerId,
      };
    }
  }
}
