import { Router } from "express";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "roomManager">;

export default function (deps: UsedDependencies): Router {
  const { roomManager } = deps;

  const router = Router();

  router.get('/', (_, res) => {
    res.json(roomManager.listGames());
  });

  return router;
}