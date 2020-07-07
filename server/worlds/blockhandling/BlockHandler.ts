import { bresenhamsLine } from '../../libcore/core/misc.ts';
import { Block } from '../../libcore/core/models/Block.ts';
import { TileId } from '../../libcore/core/models/TileId.ts';
import { TileLayer } from '../../libcore/core/models/TileLayer.ts';
import { BlockBufferPacket } from '../../libcore/core/networking/game/BlockBuffer.ts';
import { BlockLinePacket, BLOCK_LINE_ID } from '../../libcore/core/networking/game/BlockLine.ts';
import { BlockSinglePacket, BLOCK_SINGLE_ID } from '../../libcore/core/networking/game/BlockSingle.ts';
import { ServerBlockBufferPacket, SERVER_BLOCK_BUFFER_ID } from '../../libcore/core/networking/game/ServerBlockBuffer.ts';
import { ServerBlockLinePacket, SERVER_BLOCK_LINE_ID } from '../../libcore/core/networking/game/ServerBlockLine.ts';
import { ServerBlockSinglePacket, SERVER_BLOCK_SINGLE_ID } from '../../libcore/core/networking/game/ServerBlockSingle.ts';
import { WorldPacket } from '../../libcore/core/networking/game/WorldPacket.ts';
import { User } from '../User.ts';
import { ValidMessage } from '../ValidMessage.ts';

function newBlock(id: TileId): Block {
  return { id };
}

type ServerBufferPackets = ServerBlockSinglePacket | ServerBlockLinePacket;
type BroadcastFunction = (message: WorldPacket) => Promise<void>;

export class BlockHandler {
  receiveQueue: ServerBufferPackets[] = [];
  readonly map: Block[][][];

  constructor(
    private readonly _width: number,
    private readonly _height: number,
    private readonly broadcast: BroadcastFunction,
  ) {

    this.map = [];
    for (let layer = 0; layer <= TileLayer.Background; layer++) {
      let layerMap: Block[][] = [];
      this.map[layer] = layerMap;

      for (let y = 0; y < _height; y++) {
        let yMap: Block[] = [];
        layerMap[y] = yMap;

        for (let x = 0; x < _width; x++) {

          if (layer === TileLayer.Foreground) {
            // TODO: cleanup border initialization stuff
            let xMap: Block = newBlock((y === 0 || y === _height - 1 || x === 0 || x === _width - 1) ? TileId.Full : TileId.Empty);
            yMap[x] = xMap;
          }
          else {
            yMap[x] = newBlock(TileId.Empty);
          }
        }
      }
    }

    // put a gun somewhere in the world
    // we don't want it on the border, so we'll place it somewhere random within width - 2 and height - 2

    // |0 basically casts to int, see asmjs
    let gunX = (Math.random() * (_width - 2))|0;
    let gunY = (Math.random() * (_height - 2))|0;

    this.map[TileLayer.Action][gunY + 1][gunX + 1].id = TileId.Gun;

    // handle the block queue every 83ms - aka about once every 5 frames per second
    // should be good enough to allow for multiple packets to stick all together
    setInterval(this.queueHandler.bind(this), 83);
  }

  private async queueHandler(): Promise<void> {
    // if this was multithreaded, this will be thread safe
    // but grab all the blocks we need to handle here
    const receiveQueue = this.receiveQueue;
    this.receiveQueue = [];

    if (receiveQueue.length === 0) return;

    // no need to buffer anything if there's just one packet
    if (receiveQueue.length === 1) {
      console.log('broadcasting single', receiveQueue[0]);
      await this.broadcast(receiveQueue[0]);
      return;
    }

    const buffer: ServerBlockBufferPacket = {
      packetId: SERVER_BLOCK_BUFFER_ID,
      blocks: receiveQueue,
    };

    await this.broadcast(buffer);
  }

  handleSingle(packet: BlockSinglePacket, sender: User): ValidMessage {

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

  handleLine(packet: BlockLinePacket, sender: User): ValidMessage {

    // TODO: make incoming schemas check for y and x out of bounds
    // lower bounds handled by schema itself
    if (packet.start.y >= this._height || packet.start.x >= this._width
      || packet.end.y >= this._height || packet.end.x >= this._width) {
      sender.kill();
      return ValidMessage.IsNotValidMessage;
    }
    
    // currently you can't place blocks above y 3 because placing blocks at (0, 1) and (1, 0) cause some really weird crud
    // it's a TODO to fix them, but for now this is a hot-fix.
    if (packet.start.y < 3 || packet.end.y < 3) return ValidMessage.IsNotValidMessage;

    // can only place blocks if the gun isn't equipped
    if (sender.hasGun && sender.gunEquipped) {
      return ValidMessage.IsNotValidMessage;
    }
    
    let didUpdate = false;

    // packet is known good, update world
    bresenhamsLine(packet.start.x, packet.start.y, packet.end.x, packet.end.y, (x: number, y: number) => {
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

  handleBuffer(packet: BlockBufferPacket, sender: User): ValidMessage {
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