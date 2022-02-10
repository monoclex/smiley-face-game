import { TileLayer } from "../types";
import { BlockStoring } from "./storage/BlockStoring";

export interface BlockConfig {
  textureId: string;
  storing: BlockStoring;
  preferredLayer: TileLayer;
  isSolid: boolean | undefined;
}

export interface PackConfig {
  name: string;
  blocks: BlockInfo[];
}

export interface GenericRegistration {
  readonly sourceId: number;
  registerMany<T>(data: T[], makeConfig: (data: T, index: number) => BlockConfig): BlockInfo[];
  register(config: BlockConfig): BlockInfo;
  register(config: BlockConfig, isSpecialEmptyBlock: "special-empty-block"): BlockInfo;
  pack(config: PackConfig): PackInfo;
}

export interface BlockInfo {
  id: number;
  textureId: string;
  storing: BlockStoring;
  preferredLayer: TileLayer;
  isSolid: boolean | undefined;
}

export type PackInfo = PackConfig;

export class NewTileRegistration implements GenericRegistration {
  _sourceId: number = 0;

  get sourceId(): number {
    return this._sourceId;
  }

  _nextId = 1;
  readonly _idToBlock: Map<number, BlockInfo> = new Map();
  readonly _textureToBlock: Map<string, BlockInfo> = new Map();
  readonly _sourceToBlocks: Map<number, BlockInfo[]> = new Map();
  readonly _packs: PackInfo[] = [];

  registerMany<T>(manyData: T[], makeConfig: (data: T, index: number) => BlockConfig): BlockInfo[] {
    const blocks: BlockInfo[] = [];

    let i = 0;
    for (const data of manyData) {
      blocks.push(this.register(makeConfig(data, i)));
      i += 1;
    }

    return blocks;
  }

  register(config: BlockConfig, specialEmptyBlock?: "special-empty-block"): BlockInfo {
    const id = specialEmptyBlock === "special-empty-block" ? 0 : this._nextId++;

    const blockInfo: BlockInfo = {
      id: id,
      textureId: config.textureId,
      storing: config.storing,
      preferredLayer: config.preferredLayer,
      isSolid: config.isSolid,
    };

    this._idToBlock.set(id, blockInfo);
    this._textureToBlock.set(blockInfo.textureId, blockInfo);
    this.getSourceBlocks().push(blockInfo);

    return blockInfo;
  }

  pack(config: PackConfig): PackConfig {
    this._packs.push(config);
    return config;
  }

  private getSourceBlocks() {
    let sourceBlocks = this._sourceToBlocks.get(this.sourceId);

    if (!sourceBlocks) {
      sourceBlocks = [];
      this._sourceToBlocks.set(this.sourceId, sourceBlocks);
    }

    return sourceBlocks;
  }
}

export default class TileRegistration {
  constructor(readonly registerer: NewTileRegistration) {
    const empty = this.packs.find(({ name }) => name === "empty")!;
    if (!empty) throw new Error("Couldnt find epmty pack");

    this.emptyPack = empty;

    for (let i = 0; i < this.packs.length; i++) {
      if (this.packs[i].name === "empty") {
        this.packs.splice(i, 1);
        i -= 1;
      }
    }
  }

  get packs(): PackInfo[] {
    return this.registerer._packs;
  }

  readonly emptyPack: PackInfo;

  for(id: number | string): BlockInfo {
    if (typeof id === "number") return this.forId(id);
    else return this.forTexture(id);
  }

  forId(id: number): BlockInfo {
    const block = this.registerer._idToBlock.get(id);

    if (!block) {
      throw new Error(`could not find block for id ${id}`);
    }

    return block;
  }

  forTexture(texture: string): BlockInfo {
    const block = this.registerer._textureToBlock.get(texture);

    if (!block) {
      throw new Error(`could not find texture ${texture}`);
    }

    return block;
  }

  forSrc(sourceId: number): BlockStoring {
    const blocks = this.registerer._sourceToBlocks.get(sourceId);
    if (!blocks || !blocks[0]) throw new Error(`could not find source for ${sourceId}`);

    return blocks[0].storing;
  }

  texture(id: number): string {
    return this.forId(id).textureId;
  }

  id(texture: string): number {
    return this.forTexture(texture).id;
  }
}
