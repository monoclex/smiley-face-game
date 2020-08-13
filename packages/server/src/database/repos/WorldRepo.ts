import { Connection, Repository } from "typeorm";
import { validateWorldId } from "@smiley-face-game/api/schemas/WorldId";
import { Block } from "@smiley-face-game/api/schemas/Block";
import Account from "@/database/models/Account";
import World from "@/database/models/World";
import ensureValidates from "./ensureValidates";

type WorldWithoutOwner = Omit<World, "owner">;
type QueryOptions = { withOwner: boolean };

type AccountLike = Pick<Account, "id">;

// TODO: should this be made a schema?
interface WorldDetails {
  readonly owner: AccountLike;
  readonly width: number;
  readonly height: number;
  readonly blocks?: Block[][][];
}

export default class WorldRepo {
  readonly #repo: Repository<World>;

  constructor(connection: Connection) {
    this.#repo = connection.getRepository(World);
  }

  /* === queries === */

  findById(id: string, options: { withOwner: true }): Promise<World>;
  findById(id: string, options?: { withOwner: false }): Promise<WorldWithoutOwner>;
  findById(id: string, options?: QueryOptions): Promise<World | WorldWithoutOwner> {
    ensureValidates(validateWorldId, id);

    let findOptions = {};
    if (options?.withOwner === true) findOptions = { ...findOptions, relations: ["owner"] };

    return this.#repo.findOneOrFail({ id }, findOptions);
  }

  /* === creation === */

  create(details: WorldDetails): Promise<World> {
    // TODO: verify details given
    
    // all computed assignments are stated in plain sight before assignment
    const blocks = !!details.blocks ? JSON.stringify(details.blocks) : emptyWorld;

    let world = this.#repo.create();
    // @ts-expect-error
    world.owner = details.owner;
    world.width = details.width;
    world.height = details.height;
    world.rawWorldData = blocks;

    return this.#repo.save(world);
  }
}

const emptyWorld = JSON.stringify({});
