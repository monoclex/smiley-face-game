import { Router } from "express";
import { Connection } from "typeorm";
import Account from "@/database/models/Account";
import World from "@/database/models/World";
import JwtVerifier from "@/jwt/JwtVerifier";
import jwt from "@/middlewares/jwt";

export default function (connection: Connection, jwtVerifier: JwtVerifier): Router {
  const users = connection.getRepository(Account);
  const worlds = connection.getRepository(World);

  const router = Router();

  router.get('/worlds', jwt(jwtVerifier, async (req, res) => {
    const userId: string = req.jwt.aud;
    const user = await users.findOne(userId);

    const worldsPayload = [];

    for (const world of await worlds.find({ where: { owner: user } })) {
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
    const user = await users.findOne(userId);

    if (user === undefined) {
      console.error('accepted invalid token in /worlds, token', userId);
      res.status(500);
      return;
    }

    const world = worlds.create();
    world.owner = user;
    world.worldData = [];
    await worlds.save(world);
    res.json({ id: world.id });
  }));

  return router;
}