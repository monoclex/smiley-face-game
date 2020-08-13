import { Router } from "express";
import { Connection } from 'typeorm';
import apiRouterFactory from "./api/v1";
import authRouterFactory from "./auth";
import lobbyRouter from "./lobby";
import wsGameRouter from "./ws/game";
import JwtVerifier from "@/jwt/JwtVerifier";

export default function (connection: Connection, verifier: JwtVerifier): Router {
  const router = Router();

  router.use('/ws/game', wsGameRouter(connection, verifier));
  router.use('/lobby', lobbyRouter);
  router.use('/auth', authRouterFactory(connection));
  router.use('/api/v1', apiRouterFactory(connection, verifier));

  return router;
}