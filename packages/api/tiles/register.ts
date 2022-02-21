import { Config } from "../physics/ee/Config";
import { Vector } from "../physics/Vector";
import { TileLayer } from "../types";

export default class Tiles {
  readonly emptyPack: PackInfo;
  readonly packs: Readonly<PackInfo[]>;
  readonly idToBlock: Map<number, BlockInfo>;
  readonly textureToBlock: Map<string, BlockInfo>;

  constructor(maker: TilesMaker) {
    this.packs = Object.freeze(maker.packs);
    this.idToBlock = maker.map;

    const origTextureToBlock = new Map(
      Array.from(maker.map.values()).map((block) => [block.textureId, block])
    );

    const aliasTextureToBlock = new Map(
      Array.from(maker.aliasMap.entries()).flatMap(([name, aliases]) => {
        const block = origTextureToBlock.get(name);
        if (!block) throw new Error(`error correlating alias ${aliases[0]} to block ${name}`);

        return aliases.map((alias) => [alias, block]);
      })
    );

    this.textureToBlock = new Map([
      ...origTextureToBlock.entries(),
      ...aliasTextureToBlock.entries(),
    ]);

    const emptyPack = maker.packs.find((pack) => pack.name === "empty");
    if (!emptyPack) throw new Error("no empty pack registered");

    this.emptyPack = emptyPack;
  }

  static make(): Tiles {
    return new Tiles(makeTiles());
  }

  for(id: number | string): BlockInfo {
    if (typeof id === "number") return this.forId(id);
    else return this.forTexture(id);
  }

  forId(id: number): BlockInfo {
    const block = this.idToBlock.get(id);

    if (!block) {
      throw new Error(`could not find block for id ${id}`);
    }

    return block;
  }

  tryForId(id: number): BlockInfo | undefined {
    return this.idToBlock.get(id);
  }

  forTexture(texture: string): BlockInfo {
    const block = this.textureToBlock.get(texture);

    if (!block) {
      throw new Error(`could not find texture ${texture}`);
    }

    return block;
  }

  texture(id: number): string {
    return this.forId(id).textureId;
  }

  id(texture: string): number {
    return this.forTexture(texture).id;
  }
}

export enum HeapKind {
  None,
  Sign,
}

export enum Behavior {
  Typical,
  Hazard,
  Boost,
  Zoost,
}

export type StateStorageKey = "redkey";

export interface BlockConfig {
  id: number;
  textureId: string;
  preferredLayer?: TileLayer;
  isSolid?: boolean;
  heap?: HeapKind;
  direction?: Vector;
  gravitationalPull?: Vector | undefined;
  requiredForce?: Vector | undefined;
  behavior?: Behavior;
  stateStorage?: StateStorageKey | undefined;
  negateCollisionFromState?: boolean;
}

export type BlockInfo = Readonly<{
  id: number;
  textureId: string;
  preferredLayer: TileLayer;
  isSolid: boolean;
  heap: HeapKind;
  direction: Vector;
  gravitationalPull: Vector | undefined;
  requiredForce: Vector | undefined;
  behavior: Behavior;
  stateStorage: StateStorageKey | undefined;
  negateCollisionFromState: boolean;
}>;

export interface PackConfig {
  name: string;
  visible?: boolean;
}

export type PackInfo = Readonly<{
  name: string;
  blocks: Readonly<BlockInfo[]>;
  visible: boolean;
}>;

export class TilesMaker {
  map: Map<number, BlockInfo> = new Map();
  aliasMap: Map<string, string[]> = new Map();
  usedIds: Set<number> = new Set();
  unpackedBlocks: BlockInfo[] = [];

  packs: PackInfo[] = [];

  block({
    id,
    textureId,
    preferredLayer,
    isSolid,
    heap,
    direction,
    gravitationalPull,
    requiredForce,
    behavior,
    stateStorage,
    negateCollisionFromState,
  }: BlockConfig): BlockInfo {
    preferredLayer ??= TileLayer.Foreground;
    isSolid ??= true;
    heap ??= HeapKind.None;
    direction ??= Vector.Zero;
    behavior ??= Behavior.Typical;
    negateCollisionFromState ??= false;

    if (this.usedIds.has(id))
      throw new Error(`tile id already registered: ${id} (duplicate: ${textureId})`);

    const info = Object.freeze({
      id,
      textureId,
      preferredLayer,
      isSolid,
      heap,
      direction,
      gravitationalPull,
      requiredForce,
      behavior,
      stateStorage,
      negateCollisionFromState,
    });

    this.map.set(id, info);
    this.usedIds.add(id);
    this.unpackedBlocks.push(info);

    return info;
  }

  blocks<T>(data: Iterable<T>, factory: (data: T) => BlockConfig): BlockInfo[] {
    let blocks = [];

    for (const config of data) {
      const block = this.block(factory(config));
      blocks.push(block);
    }

    return blocks;
  }

  alias(textureName: string, aliasName: string | string[]) {
    const aliasNames = typeof aliasName === "string" ? [aliasName] : aliasName;

    const aliasArray = this.aliasMap.get(textureName);

    if (aliasArray) {
      aliasArray.push(...aliasNames);
    } else {
      this.aliasMap.set(textureName, aliasNames);
    }
  }

  aliases(aliases: Iterable<[string, string | string[]]>) {
    for (const [textureName, aliasName] of aliases) {
      this.alias(textureName, aliasName);
    }
  }

  pack({ name, visible }: PackConfig): PackInfo {
    visible ??= true;

    const pack = Object.freeze({ name, blocks: Object.freeze(this.unpackedBlocks), visible });

    this.unpackedBlocks = [];
    this.packs.push(pack);

    return pack;
  }

  /**
   * Helper for creating a "solid" block pack of blocks.
   */
  helpMakeSolid(name: string, start: number, end: number, tiles: string[]) {
    if (end - start !== tiles.length) {
      throw new Error(`invalid range detected ${start} to ${end} (${tiles.length} tiles)`);
    }

    const idAndSuffixes = zip(range(start, end), tiles);

    this.blocks(idAndSuffixes, ([id, suffix]) => ({
      id,
      textureId: name + "-" + suffix,
    }));

    this.pack({ name });
  }
}

const directions = ["up", "right", "down", "left"] as const;
const vectorDirection: { [K in typeof directions[number]]: Vector } = {
  up: Vector.Up,
  right: Vector.Right,
  down: Vector.Down,
  left: Vector.Left,
};

const actionBlock: Partial<BlockConfig> = { isSolid: false, preferredLayer: TileLayer.Action };

const decorationBlock: Partial<BlockConfig> = {
  isSolid: false,
  preferredLayer: TileLayer.Decoration,
};

function makeTiles() {
  const make = new TilesMaker();

  makeEmpty(make);
  makeBasic(make);
  makeGravity(make);
  makeGun(make);
  makePrismarine(make);
  makeGemstone(make);
  makeTShell(make);
  makePyramid(make);
  makeChocolate(make);
  makeBoost(make);
  makeKeys(make);
  makeZoost(make);
  makeSign(make);
  makeSpike(make);

  return make;
}

function makeSpike(make: TilesMaker) {
  make.blocks(zip(range(73, 78), [...directions, "checkpoint" as const]), ([id, suffix]) => ({
    id,
    textureId: "spike-" + suffix,
    direction: suffix !== "checkpoint" ? vectorDirection[suffix] : Vector.Zero,
    behavior: Behavior.Hazard,
    ...actionBlock,
  }));
  make.alias("spike-checkpoint", "checkpoint");
  make.pack({ name: "spike" });
}

function makeSign(make: TilesMaker) {
  make.block({
    id: 72,
    textureId: "sign",
    heap: HeapKind.Sign,
    ...decorationBlock,
  });
  make.pack({ name: "sign" });
}

function makeZoost(make: TilesMaker) {
  make.blocks(zip(range(67, 71), directions), ([id, suffix]) => ({
    id,
    textureId: "zoost-" + suffix,
    direction: vectorDirection[suffix],
    behavior: Behavior.Zoost,
    ...actionBlock,
  }));
  make.pack({ name: "zoost" });
}

function makeKeys(make: TilesMaker) {
  make.block({
    id: 64,
    textureId: "keys-red-key",
    ...actionBlock,
  });

  make.block({
    id: 65,
    textureId: "keys-red-door",
  });

  make.block({
    id: 66,
    textureId: "keys-red-gate",
  });

  make.pack({ name: "keys" });
}

function makeBoost(make: TilesMaker) {
  make.blocks(zip(range(59, 63), directions), ([id, suffix]) => ({
    id,
    textureId: "boost-" + suffix,
    direction: vectorDirection[suffix],
    gravitationalPull: Vector.Zero,
    requiredForce: Vector.mults(vectorDirection[suffix], Config.physics.boost),
    behavior: Behavior.Boost,
    ...actionBlock,
  }));
  make.pack({ name: "boost" });
}

function makeChocolate(make: TilesMaker) {
  const suffixes = ["l0", "l0mint", "l1", "l2", "l3", "l4", "l5"];
  make.helpMakeSolid("chocolate", 52, 59, suffixes);

  const chocolateBlocks = prepend("chocolate-", suffixes);
  const aliasNames = prepend("choc-", suffixes);
  make.aliases(zip(chocolateBlocks, aliasNames));
}

function makePyramid(make: TilesMaker) {
  make.helpMakeSolid("pyramid", 42, 52, [
    "white",
    "gray",
    "black",
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
  ]);
}

function makeTShell(make: TilesMaker) {
  make.helpMakeSolid("tshell", 30, 42, [
    "white",
    "gray",
    "black",
    "red",
    "orange",
    "yellow",
    "green",
    "aqua",
    "light-blue",
    "blue",
    "purple",
    "pink",
  ]);
}

function makeGemstone(make: TilesMaker) {
  make.helpMakeSolid("gemstone", 22, 30, [
    "red",
    "orange",
    "yellow",
    "green",
    "aqua",
    "blue",
    "purple",
    "pink",
  ]);
}

function makePrismarine(make: TilesMaker) {
  make.helpMakeSolid("prismarine", 17, 22, ["basic", "anchor", "brick", "slab", "crystal"]);
}

function makeGun(make: TilesMaker) {
  make.block({ id: 16, textureId: "gun", ...actionBlock });
  make.pack({ name: "gun", visible: false });
}

function makeGravity(make: TilesMaker) {
  make.blocks(zip(range(11, 16), [...directions, "dot" as const]), ([id, suffix]) => ({
    id,
    textureId: "gravity-" + suffix,
    direction: suffix !== "dot" ? vectorDirection[suffix] : Vector.Zero,
    gravitationalPull: suffix !== "dot" ? vectorDirection[suffix] : Vector.Zero,
    ...actionBlock,
  }));
  make.pack({ name: "gravity" });

  const gravityBlocks = prepend("gravity-", directions);
  const arrowedName = prepend("arrow-", directions);
  make.aliases(zip(gravityBlocks, arrowedName));

  make.alias("gravity-dot", "dot");
}

function makeBasic(make: TilesMaker) {
  make.helpMakeSolid("basic", 1, 11, [
    "white",
    "brown",
    "black",
    "red",
    "orange",
    "yellow",
    "green",
    "aqua",
    "blue",
    "purple",
  ]);
}

function makeEmpty(make: TilesMaker) {
  make.block({ id: 0, textureId: "empty", isSolid: false });
  make.pack({ name: "empty" });
}

// functional programming stuff

function* range(start: number, end: number) {
  for (let i = start; i < end; i++) yield i;
}

function* zip<A, B>(as: Iterable<A>, bs: Iterable<B>, strict: boolean = true): Iterable<[A, B]> {
  let a = as[Symbol.iterator]();
  let b = bs[Symbol.iterator]();

  while (1) {
    const { done: aDone, value: aVal } = a.next();
    const { done: bDone, value: bVal } = b.next();

    if (strict && aDone !== bDone) throw new Error("zipped sources differ in length");
    if (aDone || bDone) return;

    yield [aVal, bVal];
  }
}

function* prepend<A extends string, B extends Iterable<string>>(
  prepend: A,
  toEach: B
): Iterable<string> {
  for (const each of toEach) {
    yield prepend + each;
  }
}
