import { Router } from "express";
import apiRouterFactory from "./api/v1";
import authRouterFactory from "./auth";
import lobbyRouter from "./lobby";
import wsGameRouter from "./ws/game";
import Dependencies from "../dependencies";

export default function (deps: Dependencies): Router {
  const router = Router();

  router.use('/ws/game', wsGameRouter(deps));
  router.use('/lobby', lobbyRouter(deps));
  router.use('/auth', authRouterFactory(deps));
  router.use('/api/v1', apiRouterFactory(deps));

  return router;
}