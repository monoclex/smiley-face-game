// TODO: clean this file up later

import { bresenhamsLine } from "@smiley-face-game/common/misc";
import type { ZBlockSingle, ZSBlockSingle, ZBlockLine, ZSBlockLine } from "@smiley-face-game/common/packets"
import Connection from "../../worlds/Connection";
import type { ZWorldBlocks } from "@smiley-face-game/common/types";

export class BlockHandler {
  constructor(public map: ZWorldBlocks, readonly width: number, readonly height: number) {
    // TODO: make the client able to handle a map where some things may be empty
    for (let layerId = 0; layerId <= 2; layerId++) {
      const layerMap = this.map[layerId] ?? (this.map[layerId] = []);

      for (let y = 0; y < this.height; y++) {
        const yMap = layerMap[y] ?? (layerMap[y] = []);

        for (let x = 0; x < this.width; x++) {
          yMap[x] ?? (yMap[x] = 0);
        }
      }
    }
  }

  handleSingle(packet: ZBlockSingle, sender: Connection): ZSBlockSingle | void {
    const target = this.map[packet.layer][packet.position.y][packet.position.x];

    // packet is known good, only do updating work if necessary
    if (packet.block !== target) {
      // NOTE: if switching to reference types, make sure to copy the value
      this.map[packet.layer][packet.position.y][packet.position.x] = packet.block;

      // only if the packet updated any blocks do we want to queue it
      return {
        ...packet,
        packetId: "SERVER_BLOCK_SINGLE",
        playerId: sender.playerId!,
      };
    }
  }

  handleLine(packet: ZBlockLine, sender: Connection): ZSBlockLine | void {
    // for block lines, we *permit* out of bounds values because you can draw a line through them and the blocks that get placed
    // may not be exactly equal if you cap the bounds. so this opts to not do any bounds checking and does individual bounds checking
    // for each block that is placed

    let didUpdate = false;

    // packet is known good, update world
    bresenhamsLine(packet.start.x, packet.start.y, packet.end.x, packet.end.y, (x: number, y: number) => {
      // TODO: don't do bounds checking (see exploit notice in bresenhamsLine function)
      // bounds checking if the block is within bounds
      if (y < 0 || y >= this.height || x < 0 || x >= this.width) return;

      if (this.map[packet.layer][y][x] !== packet.block) {
        didUpdate = true;

        // NOTE: if switching to reference types, make sure to copy value
        this.map[packet.layer][y][x] = packet.block;
      }
    });

    // only if the packet updated any blocks do we want to queue it
    if (didUpdate) {
      // packet is known good, schedule it to be handled
      return {
        ...packet,
        packetId: "SERVER_BLOCK_LINE",
        playerId: sender.playerId!,
      };
    }
  }
}
