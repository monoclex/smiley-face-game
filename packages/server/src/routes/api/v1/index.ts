import { Router } from "express";
import { Connection } from "typeorm";
import { verifyJwtMiddleware } from '../../../middlewares/checkJwt';
import User from '../../../database/models/Account';
import World from '../../../database/models/World';

export default function (connection: Connection): Router {
  const users = connection.getRepository(User);
  const worlds = connection.getRepository(World);

  const router = Router();

  router.get('/worlds', verifyJwtMiddleware, async (req, res) => {
    //@ts-expect-error
    const userId: string = req.jwt.id;
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
  });

  router.post('/worlds', verifyJwtMiddleware, async (req, res) => {
    //@ts-expect-error
    const userId: string = req.jwt.id;
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
  });

  return router;
}