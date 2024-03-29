import { Router } from "express";
import jwt from "../../../middlewares/jwt";
import Dependencies from "../../../dependencies";
import { ZPlayerResp } from "@smiley-face-game/api/api";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "accountRepo" | "roomManager">;

export default function (deps: UsedDependencies): Router {
  const { authVerifier, accountRepo, roomManager } = deps;

  const router = Router();

  router.get(
    "/",
    jwt(authVerifier, async (req, res) => {
      if (req.jwt.aud === "") {
        res.status(400).json({ error: "Cannot load player information for guest" });
        return;
      }

      const account = await accountRepo.findByIdWithWorlds(req.jwt.aud);

      const response: ZPlayerResp = {
        name: account.username,
        energy: {
          energy: account.currentEnergy,
          maxEnergy: account.maxEnergy,
          energyRegenerationRateMs: account.energyRegenerationRateMs,
          lastEnergyAmount: account.lastEnergyAmount,
          // TODO: don't use a bigint for unix epoch timestamp lol
          timeEnergyWasAtAmount: parseInt(account.timeEnergyWasAtAmount),
        },
        ownedWorlds: account.worlds.map((world) => ({
          type: "saved",
          id: world.id,
          name: world.name,
          playerCount: roomManager.getSaved(world.id)?.playerCount ?? 0,
        })),
      };

      res.json(response);
    })
  );

  return router;
}
