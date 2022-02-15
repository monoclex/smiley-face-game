import type TileRegistration from "@smiley-face-game/api/tiles/TileRegistration";
import { Repository } from "typeorm";
import type { ZBlock, ZHeaps, ZWorldBlocks } from "@smiley-face-game/api/types";
import { zAccountId, zWorldId } from "@smiley-face-game/api/types";
import AccountLike from "../../database/modelishs/AccountLike";
import WorldLike from "../../database/modelishs/WorldLike";
import World from "../../database/models/World";
import generateWorld from "../../worlds/generateWorld";
import ensureValidates from "../../ensureValidates";
import { Blocks } from "@smiley-face-game/api/game/Blocks";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { FormatLoader } from "@smiley-face-game/api/tiles/format/FormatLoader";
import { saveWorldVersion2 } from "@smiley-face-game/api/tiles/format/WorldDataVersion2";

function emptyWorld(details: WorldDetails, tileJson: TileRegistration): string {
  return generateWorld(details.width, details.height, tileJson);
}

export function serialize(
  size: Vector,
  blocks: ZWorldBlocks,
  heaps: ZHeaps,
  tileJson: TileRegistration
) {
  const format = new FormatLoader(tileJson, size);
  format.world.state = blocks;
  format.heap.state = heaps;

  return saveWorldVersion2(format);
}

type QueryOptions = { withOwner: boolean };

// TODO: should this be made a schema?
interface WorldDetails {
  readonly owner: AccountLike;
  readonly name?: string;
  readonly width: number;
  readonly height: number;
  readonly blocks?: ZBlock[][][];
}

export default class WorldRepo {
  readonly #repo: Repository<World>;

  constructor(repo: Repository<World>) {
    this.#repo = repo;
  }

  /* === queries === */

  findById(id: string, options: { withOwner: true }): Promise<World>;
  findById(id: string, options?: { withOwner: false }): Promise<WorldLike>;
  findById(id: string, options?: QueryOptions): Promise<World | WorldLike> {
    ensureValidates(zWorldId, id);

    let findOptions = {};
    if (options?.withOwner === true) findOptions = { ...findOptions, relations: ["owner"] };

    return this.#repo.findOneOrFail({ id }, findOptions);
  }

  /** Finds all the worlds owned by a given Account (based on the Account's Id). */
  findOwnedBy(accountId: string): Promise<World[]> {
    ensureValidates(zAccountId, accountId);

    return this.#repo.find({ where: { owner: { id: accountId } } });
  }

  /* === creation === */

  create(details: WorldDetails, tileJson: TileRegistration): Promise<World> {
    // TODO: verify details given

    // all computed assignments are stated in plain sight before assignment
    const blocks = JSON.stringify(
      serialize(
        { x: details.width, y: details.height },
        details.blocks ? details.blocks : JSON.parse(emptyWorld(details, tileJson)),
        [],
        tileJson
      )
    );
    const name = details.name ? details.name : `${details.owner.username}'s World`;

    const world = this.#repo.create();
    // @ts-expect-error typeorm doesn't care about missing the `worlds` field, i think. idk
    world.owner = details.owner;
    world.name = name;
    world.width = details.width;
    world.height = details.height;
    world.rawWorldData = blocks;
    world.worldDataVersion = 2;

    return this.#repo.save(world);
  }

  /* === modification === */

  /**
   * @deprecated
   * Not actually deprecated, just highly suggested not to use until an alternative is propely thought about.
   */
  save(world: World | WorldLike): Promise<World> {
    return this.#repo.save(world);
  }
}
