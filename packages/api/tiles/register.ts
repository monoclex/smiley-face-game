import { Config } from "../physics/Config";
import { EEPhysics } from "../physics/EEPhysics";
import { Player } from "../physics/Player";
import { Rectangle } from "../physics/Rectangle";
import { Vector } from "../physics/Vector";
import { TileLayer, ZHeap, ZKeyKind } from "../types";
import { KeyBehavior, KeyDoorGateBehavior } from "./complexBehaviors/KeysBehavior";
import { SwitchButtonBehavior, SwitchDoorGateBehavior } from "./complexBehaviors/SwitchBehavior";
import { slabHitbox, solidHitbox } from "./hitboxes";

// next new id: 119

// TODO(automation): have a command developers can run to get a list of IDs
//   used to then know what the last ID available is

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
  Switch,
}

export enum Behavior {
  Typical,
  Hazard,
  Boost,
  Zoost,
}

export interface ComplexBlockBehavior {
  collides(
    world: EEPhysics,
    player: Player,
    id: number,
    heap: ZHeap | 0,
    playerHitbox: Rectangle
  ): boolean;

  near(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void;
  far(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void;

  in(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void;
  out(world: EEPhysics, player: Player, id: number, heap: ZHeap | 0): void;
}

export interface BlockConfig {
  id: number;
  textureId: string;
  preferredLayer?: TileLayer;
  isSolid?: boolean;
  hitbox?: Rectangle;
  heap?: HeapKind;
  direction?: Vector;
  gravitationalPull?: Vector | undefined;
  requiredForce?: Vector | undefined;
  behavior?: Behavior;
  complex?: ComplexBlockBehavior;
}

export type BlockInfo = Readonly<{
  id: number;
  textureId: string;
  preferredLayer: TileLayer;
  hitbox: Rectangle | undefined;
  heap: HeapKind;
  direction: Vector;
  gravitationalPull: Vector | undefined;
  requiredForce: Vector | undefined;
  behavior: Behavior;
  complex: undefined | ComplexBlockBehavior;
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
    hitbox,
    heap,
    direction,
    gravitationalPull,
    requiredForce,
    behavior,
    complex,
  }: BlockConfig): BlockInfo {
    preferredLayer ??= TileLayer.Foreground;
    heap ??= HeapKind.None;
    direction ??= Vector.Zero;
    behavior ??= Behavior.Typical;

    if (this.usedIds.has(id))
      throw new Error(`tile id already registered: ${id} (duplicate: ${textureId})`);

    if (!hitbox) {
      if (isSolid === undefined) hitbox = solidHitbox;
      else hitbox = isSolid ? solidHitbox : undefined;
    }

    const info = Object.freeze({
      id,
      textureId,
      preferredLayer,
      hitbox,
      heap,
      direction,
      gravitationalPull,
      requiredForce,
      behavior,
      complex,
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
  helpMakeSolid(name: string, start: number, end: number, tiles: string[], pack: boolean = true) {
    if (end - start !== tiles.length) {
      throw new Error(`invalid range detected ${start} to ${end} (${tiles.length} tiles)`);
    }

    const idAndSuffixes = zip(range(start, end), tiles);

    this.blocks(idAndSuffixes, ([id, suffix]) => ({
      id,
      textureId: name + "-" + suffix,
    }));

    if (pack) {
      this.pack({ name });
    }
  }
}

// TODO(automation): make this stuff really easy to auto generate from the client,
//   or just more sophisticated somehow
// TODO(performance): make the keys the numeric ID of the block
export function minimapColors() {
  return {
    empty: 0x0e0e0e,
    "basic-white": 0xa4a4a4,
    "basic-brown": 0x8b6543,
    "basic-black": 0x4d4d4d,
    "basic-red": 0xa42222,
    "basic-orange": 0xa45822,
    "basic-yellow": 0xa49022,
    "basic-green": 0x22a433,
    "basic-aqua": 0x22a4a4,
    "basic-blue": 0x2235a4,
    "basic-purple": 0x7d22a4,
    "prismarine-basic": 0x225379,
    "prismarine-anchor": 0x204c76,
    "prismarine-brick": 0x255382,
    "prismarine-slab": 0x255581,
    "prismarine-crystal": 0x254678,
    "prismarine-hollow": 0x25568d,
    "prismarine-slab-up": 0x23537e,
    "prismarine-slab-right": 0x265886,
    "prismarine-slab-down": 0x265885,
    "prismarine-slab-left": 0x24547f,
    "gemstone-red": 0xa00300,
    "gemstone-orange": 0xa06000,
    "gemstone-yellow": 0xa08900,
    "gemstone-green": 0x25a000,
    "gemstone-aqua": 0x00a096,
    "gemstone-blue": 0x1000a0,
    "gemstone-purple": 0x6e00a0,
    "gemstone-pink": 0xa00075,
    "tshell-white": 0xb7b7b7,
    "tshell-gray": 0x7c7c7c,
    "tshell-black": 0x404040,
    "tshell-red": 0xbc5e6c,
    "tshell-orange": 0xbc875e,
    "tshell-yellow": 0xbabb5e,
    "tshell-green": 0x83bc5e,
    "tshell-aqua": 0x5ebca6,
    "tshell-light-blue": 0x5e9abc,
    "tshell-blue": 0x5e64bc,
    "tshell-purple": 0x8f5ebc,
    "tshell-pink": 0xbb5eb2,
    "pyramid-white": 0xc2c2c2,
    "pyramid-gray": 0x818181,
    "pyramid-black": 0x595959,
    "pyramid-red": 0xb95270,
    "pyramid-orange": 0xc56b4a,
    "pyramid-yellow": 0xa9ba52,
    "pyramid-green": 0x5eba51,
    "pyramid-cyan": 0x53b6bb,
    "pyramid-blue": 0x526eba,
    "pyramid-purple": 0xa952ba,
    "chocolate-l0": 0xe3e3e3,
    "chocolate-l0mint": 0xcbcac9,
    "chocolate-l1": 0xfde887,
    "chocolate-l2": 0xeea75a,
    "chocolate-l3": 0xc36d33,
    "chocolate-l4": 0x713617,
    "chocolate-l5": 0x311809,
    "keys-white-door": 0x858585,
    "keys-white-gate": 0x828282,
    "keys-gray-door": 0x606060,
    "keys-gray-gate": 0x707070,
    "keys-black-door": 0x424242,
    "keys-black-gate": 0x616161,
    "keys-red-door": 0x804053,
    "keys-red-gate": 0x806069,
    "keys-orange-door": 0x864e39,
    "keys-orange-gate": 0x83675d,
    "keys-yellow-door": 0x768040,
    "keys-yellow-gate": 0x7b8060,
    "keys-green-door": 0x488040,
    "keys-green-gate": 0x648060,
    "keys-aqua-door": 0x407d80,
    "keys-aqua-gate": 0x607e80,
    "keys-blue-door": 0x405180,
    "keys-blue-gate": 0x606980,
    "keys-purple-door": 0x754080,
    "keys-purple-gate": 0x7b6080,
    "switches-switch-door": 0x41047c,
    "switches-switch-gate": 0x7612e4,
  };
}

export const directions = ["up", "right", "down", "left"] as const;
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
  makeSwitches(make);

  return make;
}

function makeSwitches(make: TilesMaker) {
  make.block({
    id: 116,
    textureId: `switches-switch-button`,
    complex: new SwitchButtonBehavior(),
    heap: HeapKind.Switch,
    ...actionBlock,
  });

  make.block({
    id: 117,
    textureId: `switches-switch-door`,
    complex: new SwitchDoorGateBehavior(false),
    heap: HeapKind.Switch,
  });

  make.block({
    id: 118,
    textureId: `switches-switch-gate`,
    complex: new SwitchDoorGateBehavior(true),
    heap: HeapKind.Switch,
  });

  make.pack({ name: "switches" });
}

function makeSpike(make: TilesMaker) {
  make.blocks(zip(range(73, 77), directions), ([id, suffix]) => ({
    id,
    textureId: "spike-" + suffix,
    direction: vectorDirection[suffix],
    behavior: Behavior.Hazard,
    ...actionBlock,
  }));

  make.block({
    id: 77,
    textureId: "spike-checkpoint",
    ...actionBlock,
  });

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

  make.blocks(
    zip(range(113, 116), ["sign-stone", "sign-metal", "sign-rusted"]),
    ([id, textureId]) => ({
      id,
      textureId,
      heap: HeapKind.Sign,
      ...decorationBlock,
    })
  );

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
  const makeKey = (kind: ZKeyKind, idGen: Iterable<number>) => {
    const ids = Array.from(idGen);
    if (ids.length !== 3) throw new Error("more than 3 ids");

    make.block({
      id: ids[0],
      textureId: `keys-${kind}-key`,
      complex: new KeyBehavior(kind),
      ...actionBlock,
    });

    make.block({
      id: ids[1],
      textureId: `keys-${kind}-door`,
      complex: new KeyDoorGateBehavior(kind, false),
    });

    make.block({
      id: ids[2],
      textureId: `keys-${kind}-gate`,
      isSolid: false,
      complex: new KeyDoorGateBehavior(kind, true),
    });
  };

  makeKey("white", range(86, 89));
  makeKey("gray", range(89, 92));
  makeKey("black", range(92, 95));
  makeKey("red", range(64, 67));
  makeKey("orange", range(95, 98));
  makeKey("yellow", range(98, 101));
  makeKey("green", range(101, 104));
  makeKey("aqua", range(104, 107));
  makeKey("blue", range(107, 110));
  makeKey("purple", range(110, 113));

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
  make.helpMakeSolid("prismarine", 17, 22, ["basic", "anchor", "brick", "slab", "crystal"], false);

  make.block({
    id: 82,
    textureId: "prismarine-hollow",
  });

  make.blocks(zip(range(78, 82), directions), ([id, suffix]) => ({
    id,
    textureId: "prismarine-slab-" + suffix,
    direction: vectorDirection[suffix],
    hitbox: slabHitbox[suffix],
  }));

  make.blocks(zip(range(83, 86), ["top", "middle", "bottom"]), ([id, suffix]) => ({
    id,
    textureId: "prismarine-pillar-" + suffix,
    ...decorationBlock,
  }));

  make.pack({ name: "prismarine" });
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
