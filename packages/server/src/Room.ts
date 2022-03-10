import { zPacket, ZPacketValidator } from "@smiley-face-game/api";
import { Blocks } from "@smiley-face-game/api/game/Blocks";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { FormatLoader } from "@smiley-face-game/api/tiles/format/FormatLoader";
import { saveWorldVersion2 } from "@smiley-face-game/api/tiles/format/WorldDataVersion2";
import loadWorldData from "./loadWorldData";
import tiles from "./tiles";

export default class Room {
  readonly validator: ZPacketValidator;
  readonly blocks: Blocks;
  readonly worldSize: Vector;

  constructor(readonly hostRoom: HostRoom, initialWorldData: HostWorldData) {
    this.worldSize = Vector.fromSize(hostRoom);
    this.validator = zPacket(this.worldSize.x, this.worldSize.y);

    this.blocks = new Blocks(tiles, [], [], this.worldSize);
    this.deserialize(initialWorldData);
  }

  deserialize(worldData: HostWorldData): void {
    const formatLoader = loadWorldData(this.worldSize, worldData);

    this.blocks.state = formatLoader.world;
    this.blocks.heap = formatLoader.heap;
    this.blocks.emitLoad();
  }

  serialize(): HostWorldData {
    const formatLoader = new FormatLoader(tiles, this.worldSize);
    formatLoader.world = this.blocks.state;
    formatLoader.heap = this.blocks.heap;

    const serialized = saveWorldVersion2(formatLoader);
    return { worldDataVersion: 2, worldData: JSON.stringify(serialized) };
  }
}
