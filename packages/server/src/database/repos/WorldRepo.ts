import { Connection, Repository } from "typeorm";
import type { ZBlock } from "@smiley-face-game/common/types";
import { zAccountId, zWorldId } from "@smiley-face-game/common/types";
import AccountLike from "../../database/modelishs/AccountLike";
import WorldLike from "../../database/modelishs/WorldLike";
import World from "../../database/models/World";
import generateWorld from "../../worlds/generateWorld";
import ensureValidates from "../../ensureValidates";

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

  constructor(connection: Connection) {
    this.#repo = connection.getRepository(World);
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

  create(details: WorldDetails): Promise<World> {
    // TODO: verify details given

    // all computed assignments are stated in plain sight before assignment
    const blocks = !!details.blocks ? JSON.stringify(details.blocks) : emptyWorld(details);
    const name = !!details.name ? details.name : "Untitled World";

    let world = this.#repo.create();
    // @ts-expect-error
    world.owner = details.owner;
    world.name = name;
    world.width = details.width;
    world.height = details.height;
    world.rawWorldData = blocks;

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

function emptyWorld(details: WorldDetails): string {
  return generateWorld(details.width, details.height);
}
