// TODO: clean this file up later

import { bresenhamsLine } from "@smiley-face-game/api/misc";
import { BlockBufferPacket } from "@smiley-face-game/api/packets/BlockBuffer";
import {
  BlockLinePacket,
  BLOCK_LINE_ID,
} from "@smiley-face-game/api/packets/BlockLine";
import {
  BlockSinglePacket,
  BLOCK_SINGLE_ID,
} from "@smiley-face-game/api/packets/BlockSingle";
import {
  ServerBlockBufferPacket,
  SERVER_BLOCK_BUFFER_ID,
} from "@smiley-face-game/api/packets/ServerBlockBuffer";
import {
  ServerBlockLinePacket,
  SERVER_BLOCK_LINE_ID,
} from "@smiley-face-game/api/packets/ServerBlockLine";
import {
  ServerBlockSinglePacket,
  SERVER_BLOCK_SINGLE_ID,
} from "@smiley-face-game/api/packets/ServerBlockSingle";
import { WorldPacket } from "@smiley-face-game/api/packets/WorldPacket";
import { Block } from "@smiley-face-game/api/schemas/Block";
import { TileId } from "@smiley-face-game/api/schemas/TileId";
import { TileLayer } from "@smiley-face-game/api/schemas/TileLayer";
import Connection from "@/worlds/Connection";
import World from "@/database/models/World";
import blocksEqual from "@smiley-face-game/api/tiles/blocksEqual";
import copyBlock from "@smiley-face-game/api/tiles/copyBlock";

type BroadcastFunction = (message: WorldPacket) => Promise<void>;

export class BlockHandler {
  constructor(
    readonly map: Block[][][],
    readonly width: number,
    readonly height: number
  ) {
    // TODO: make the client able to handle a map where some things may be empty
    for (let layerId = 0; layerId <= 2; layerId++) {
      const layerMap = this.map[layerId] ?? (this.map[layerId] = []);

      for (let y = 0; y < this.height; y++) {
        const yMap = layerMap[y] ?? (layerMap[y] = []);

        for (let x = 0; x < this.width; x++) {
          yMap[x] ?? (yMap[x] = { id: TileId.Empty });
        }
      }
    }
  }

  handleSingle(
    packet: BlockSinglePacket,
    sender: Connection
  ): ServerBlockSinglePacket | void {
    const target = this.map[packet.layer][packet.position.y][packet.position.x];

    // packet is known good, only do updating work if necessary
    if (!blocksEqual(packet, target)) {
      copyBlock(
        (v) =>
          (this.map[packet.layer][packet.position.y][packet.position.x] = v),
        packet
      );

      this.map[packet.layer][packet.position.y][packet.position.x].id =
        packet.id;

      // only if the packet updated any blocks do we want to queue it
      return {
        ...packet,
        packetId: SERVER_BLOCK_SINGLE_ID,
        playerId: sender.playerId!,
      };
    }
  }

  handleLine(
    packet: BlockLinePacket,
    sender: Connection
  ): ServerBlockLinePacket | void {
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
        //
        // currently you can't place blocks above y 3 because placing blocks at (0, 1) and (1, 0) cause some really weird crud
        // it's a TODO to fix them, but for now this is a hot-fix.
        if (y < 0 || y >= this.height || x < 0 || x >= this.width) return;

        if (didUpdate || this.map[packet.layer][y][x].id !== packet.id) {
          didUpdate = true;
          this.map[packet.layer][y][x].id = packet.id;
        }
      }
    );

    // only if the packet updated any blocks do we want to queue it
    if (didUpdate) {
      // packet is known good, schedule it to be handled
      return {
        ...packet,
        packetId: SERVER_BLOCK_LINE_ID,
        playerId: sender.playerId!,
      };
    }
  }

  handleBuffer(
    packet: BlockBufferPacket,
    sender: Connection
  ): ServerBlockBufferPacket | void {
    let buffer = [];

    for (const blockPacket of packet.blocks) {
      if (blockPacket.packetId === BLOCK_SINGLE_ID) {
        const result = this.handleSingle(blockPacket, sender);
        if (result !== undefined) {
          buffer.push(result);
        }
      } else if (blockPacket.packetId === BLOCK_LINE_ID) {
        const result = this.handleLine(blockPacket, sender);
        if (result !== undefined) {
          buffer.push(result);
        }
      }
    }

    if (buffer.length > 0) {
      return {
        packetId: SERVER_BLOCK_BUFFER_ID,
        blocks: buffer,
        playerId: sender.playerId!,
      };
    }
  }
}
