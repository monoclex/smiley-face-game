import { Router } from "express";
import { Connection } from "typeorm";
import Account from "@/database/models/Account";
import World from "@/database/models/World";
import JwtVerifier from "@/jwt/JwtVerifier";
import jwt from "@/middlewares/jwt";
import Dependencies from "@/dependencies";

export default function (deps: Dependencies): Router {
  const { accountRepo, worldRepo, jwtVerifier } = deps;

  const router = Router();

  router.get('/worlds', jwt(jwtVerifier, async (req, res) => {
    const userId: string = req.jwt.aud;
    const user = await accountRepo.findById(userId);

    const worldsPayload = [];

    for (const world of await worldRepo.findOwnedBy(user.id)) {
      worldsPayload.push({
        id: world.id,
        name: "not implemented yet",
        DEBUG_BLOCKS: world.worldData
      });
    }

    res.json(worldsPayload);
  }));

  router.post('/worlds', jwt(jwtVerifier, async (req, res) => {
    const userId: string = req.jwt.aud;
    const user = await accountRepo.findById(userId);

    if (user === undefined) {
      console.error('accepted invalid token in /worlds, token', userId);
      res.status(500);
      return;
    }

    const world = await worldRepo.create({
      owner: user,
      width: 100,
      height: 100,
      blocks: [],
    });
    res.json({ id: world.id });
  }));

  return router;
}