import { EntityManager } from "typeorm";
import AccountLike from "../database/modelishs/AccountLike";
import World from "../database/models/World";
import WorldRepo from "../database/repos/WorldRepo";
import TileJson from "../worlds/TileJson";

export default function makePurchaser(width: number, height: number): (user: AccountLike, entityManager: EntityManager) => Promise<void> {
  return async function purchase(user: AccountLike, entityManager: EntityManager) {
    const worldRepo = new WorldRepo(entityManager.getRepository(World));

    await worldRepo.create(
      {
        owner: user,
        width,
        height,
      },
      TileJson
    );
  };
}
