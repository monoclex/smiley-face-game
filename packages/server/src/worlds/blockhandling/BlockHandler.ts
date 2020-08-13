import { bresenhamsLine } from '@smiley-face-game/api/misc';
import { BlockBufferPacket } from '@smiley-face-game/api/networking/packets/BlockBuffer';
import { BlockLinePacket, BLOCK_LINE_ID } from '@smiley-face-game/api/networking/packets/BlockLine';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from '@smiley-face-game/api/networking/packets/BlockSingle';
import { ServerBlockBufferPacket, SERVER_BLOCK_BUFFER_ID } from '@smiley-face-game/api/networking/packets/ServerBlockBuffer';
import { ServerBlockLinePacket, SERVER_BLOCK_LINE_ID } from '@smiley-face-game/api/networking/packets/ServerBlockLine';
import { ServerBlockSinglePacket, SERVER_BLOCK_SINGLE_ID } from '@smiley-face-game/api/networking/packets/ServerBlockSingle';
import { WorldPacket } from '@smiley-face-game/api/networking/packets/WorldPacket';
import { Block } from '@smiley-face-game/api/schemas/Block';
import { TileId } from '@smiley-face-game/api/schemas/TileId';
import { TileLayer } from '@smiley-face-game/api/schemas/TileLayer';
import DbWorld from '../../database/models/World';
import { WorldUser } from '../User';
import { ValidMessage } from '../ValidMessage';

function newBlock(id: TileId): Block {
  return { id };
}

type ServerBufferPackets = ServerBlockSinglePacket | ServerBlockLinePacket;
type BroadcastFunction = (message: WorldPacket) => Promise<void>;

export class BlockHandler {
  receiveQueue: ServerBufferPackets[] = [];
  readonly map: Block[][][];

  /**
   * Prevents the block queue handler from running on the next available tick. This is useful to prevent packet loss for new players. The
   * reason why packet loss occurs is that the init handler in the world is running, and every `await` will cause execution to pause and
   * yield to some other process. In the event that it yields to the block handler, the block handler will run and will broadcast the most
   * recently placed blocks to everyone except the incoming player, so it causes them to miss some blocks if blocks are being fervently
   * placed.
   * 
   * This fixes this by allowing the queue handler to be prevented from being ran. This is turned on during an initialization message, and
   * turned off once it's done. That way it the queue will only run when important work is being performed.
   * 
   * Note: I haven't seen this bug happen, but there's a chance it may.
   */
  canRun = true;

  constructor(
    dbWorld: DbWorld | undefined,
    private readonly _width: number,
    private readonly _height: number,
    private readonly broadcast: BroadcastFunction,
  ) {
    // TODO: don't require temp variable
    let tmp;
    if (dbWorld && (tmp = dbWorld.worldData) !== []) {
      this.map = tmp;
    }
    else {
      this.map = [];
      for (let layer = 0; layer <= TileLayer.Background; layer++) {
        const layerMap: Block[][] = [];
        this.map[layer] = layerMap;

        for (let y = 0; y < _height; y++) {
          const yMap: Block[] = [];
          layerMap[y] = yMap;

          for (let x = 0; x < _width; x++) {

            if (layer === TileLayer.Foreground) {
              // TODO: cleanup border initialization stuff
              const xMap: Block = newBlock((y === 0 || y === _height - 1 || x === 0 || x === _width - 1) ? TileId.Full : TileId.Empty);
              yMap[x] = xMap;
            }
            else {
              yMap[x] = newBlock(TileId.Empty);
            }
          }
        }
      }
    }

    // put a gun somewhere in the world
    // we don't want it on the border, so we'll place it somewhere random within width - 2 and height - 2

    // |0 basically casts to int, see asmjs
    const gunX = (Math.random() * (_width - 2)) | 0;
    const gunY = (Math.random() * (_height - 2)) | 0;

    this.map[TileLayer.Action][gunY + 1][gunX + 1].id = TileId.Gun;

    // handle the block queue about every 2 frames (2 * (1000 / 60))
    // should be good enough to allow for spam packets to stick together and get sent as one to prevent users getting spammed
    setInterval(this.queueHandler.bind(this), (2 * 1000 / 60));
  }

  private async queueHandler(): Promise<void> {
    if (!this.canRun) return;

    // if this was multithreaded, this will be thread safe
    // but grab all the blocks we need to handle here
    const receiveQueue = this.receiveQueue;
    this.receiveQueue = [];

    if (receiveQueue.length === 0) return;

    // no need to buffer anything if there's just one packet
    if (receiveQueue.length === 1) {
      await this.broadcast(receiveQueue[0]);
      return;
    }

    const buffer: ServerBlockBufferPacket = {
      packetId: SERVER_BLOCK_BUFFER_ID,
      blocks: receiveQueue,
    };

    await this.broadcast(buffer);
  }

  handleSingle(packet: BlockSinglePacket, sender: WorldUser): ValidMessage {

    // TODO: make incoming schemas check for y and x out of bounds
    // lower bounds handled by schema itself
    if (packet.position.y >= this._height || packet.position.x >= this._width) {
      sender.kill();
      return ValidMessage.IsNotValidMessage;
    }

    // currently you can't place blocks above y 3 because placing blocks at (0, 1) and (1, 0) cause some really weird crud
    // it's a TODO to fix them, but for now this is a hot-fix.
    if (packet.position.y < 3) return ValidMessage.IsNotValidMessage;

    // can only place blocks if the gun isn't equipped
    if (sender.hasGun && sender.gunEquipped) {
      return ValidMessage.IsNotValidMessage;
    }

    // packet is known good, only do updating work if necessary
    if (this.map[packet.layer][packet.position.y][packet.position.x].id !== packet.id) {
      this.map[packet.layer][packet.position.y][packet.position.x].id = packet.id;

      // only if the packet updated any blocks do we want to queue it
      this.receiveQueue.push({
        ...packet,
        packetId: SERVER_BLOCK_SINGLE_ID,
        sender: sender.userId
      });
    }

    return ValidMessage.IsValidMessage;
  }

  handleLine(packet: BlockLinePacket, sender: WorldUser): ValidMessage {

    // for block lines, we *permit* out of bounds values because you can draw a line through them and the blocks that get placed
    // may not be exactly equal if you cap the bounds. so this opts to not do any bounds checking and does individual bounds checking
    // for each block that is placed

    // can only place blocks if the gun isn't equipped
    if (sender.hasGun && sender.gunEquipped) {
      return ValidMessage.IsNotValidMessage;
    }

    let didUpdate = false;

    // packet is known good, update world
    bresenhamsLine(packet.start.x, packet.start.y, packet.end.x, packet.end.y, (x: number, y: number) => {

      // bounds checking for individual blocks
      // currently you can't place blocks above y 3 because placing blocks at (0, 1) and (1, 0) cause some really weird crud
      // it's a TODO to fix them, but for now this is a hot-fix.
      if (y < 3 || y >= this._height
        || x < 0 || x >= this._width) return;

      if (didUpdate || this.map[packet.layer][y][x].id !== packet.id) {
        didUpdate = true;
        this.map[packet.layer][y][x].id = packet.id;
      }
    });

    // only if the packet updated any blocks do we want to queue it
    if (didUpdate) {
      // packet is known good, schedule it to be handled
      this.receiveQueue.push({
        ...packet,
        packetId: SERVER_BLOCK_LINE_ID,
        sender: sender.userId
      });
    }

    return ValidMessage.IsValidMessage;
  }

  handleBuffer(packet: BlockBufferPacket, sender: WorldUser): ValidMessage {
    for (const blockPacket of packet.blocks) {
      if (blockPacket.packetId === BLOCK_SINGLE_ID) {
        // TODO: figure out how to get this to typecheck maybe?
        //@ts-ignore
        const result = this.handleSingle(blockPacket, sender);

        if (result !== ValidMessage.IsValidMessage) return ValidMessage.IsNotValidMessage;
      }
      else if (blockPacket.packetId === BLOCK_LINE_ID) {
        // TODO: figure out how to get this to typecheck maybe?
        //@ts-ignore
        const result = this.handleLine(blockPacket, sender);

        if (result !== ValidMessage.IsValidMessage) return ValidMessage.IsNotValidMessage;
      }
    }

    return ValidMessage.IsValidMessage;
  }
}