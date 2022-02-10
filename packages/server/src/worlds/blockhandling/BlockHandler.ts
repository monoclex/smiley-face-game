// TODO: clean this file up later

import { bresenhamsLine } from "@smiley-face-game/api/misc";
import type {
  ZBlockSingle,
  ZSBlockSingle,
  ZBlockLine,
  ZSBlockLine,
} from "@smiley-face-game/api/packets";
import Connection from "../../worlds/Connection";
import { TileLayer, ZWorldBlocks } from "@smiley-face-game/api/types";
import equal from "fast-deep-equal";

export class BlockHandler {
  constructor(public map: ZWorldBlocks, readonly width: number, readonly height: number) {
    for (let layerId = TileLayer.Foreground; layerId <= TileLayer.Decoration; layerId++) {
      const layerMap = this.map[layerId];
      if (layerMap === undefined || layerMap === null) continue;

      for (let y = 0; y < this.height; y++) {
        const yMap = layerMap[y];
        if (yMap === undefined || yMap === null) continue;

        for (let x = 0; x < this.width; x++) {
          if (yMap[x] === undefined || yMap[x] === null) {
            yMap[x] = 0;
          }
        }
      }
    }
  }

  getMap(layer: number, y: number, x: number): number {
    let wLayer = this.map[layer];
    if (wLayer === undefined || wLayer === null) {
      this.map[layer] = wLayer = [];
    }

    let wY = wLayer[y];
    if (wY === undefined || wY === null) {
      this.map[layer][y] = wY = [];
    }

    const wX = wY[x];
    if (wX === undefined || wX === null) {
      wY[x] = 0;
      return 0;
    }

    return wX;
  }

  handleSingle(packet: ZBlockSingle, sender: Connection): ZSBlockSingle | void {
    const target = this.getMap(packet.layer, packet.position.y, packet.position.x);

    // packet is known good, only do updating work if necessary
    if (packet.block !== target || !equal(packet.heap, undefined)) {
      // NOTE: if switching to reference types, make sure to copy the value
      this.map[packet.layer][packet.position.y][packet.position.x] = packet.block;

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

        if (this.getMap(packet.layer, y, x) !== packet.block || !equal(packet.heap, undefined)) {
          didUpdate = true;

          // NOTE: if switching to reference types, make sure to copy value
          this.map[packet.layer][y][x] = packet.block;
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
