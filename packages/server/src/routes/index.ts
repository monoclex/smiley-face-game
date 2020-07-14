import { Router } from "express";
import { Connection } from 'typeorm';
import authRouterFactory from "./auth";
import lobbyRouter from "./lobby";
import wsGameRouter from "./ws/game";

export default function (connection: Connection): Router {
  const router = Router();

  router.use('/ws/game', wsGameRouter(connection));
  router.use('/lobby', lobbyRouter);
  router.use('/auth', authRouterFactory(connection));

  return router;
}