import { Router } from "express";
import jwt from "@/middlewares/jwt";
import Dependencies from "@/dependencies";

export default function (deps: Dependencies): Router {
  const { accountRepo, worldRepo, jwtVerifier } = deps;

  const router = Router();

  // TODO: strongly typed results?
  router.get('/worlds', jwt(jwtVerifier, async (req, res) => {
    const worldsPayload = [];
    
    const accountId = req.jwt.aud;
    for (const world of await worldRepo.findOwnedBy(accountId)) {
      worldsPayload.push({
        id: world.id,
        name: world.name,
        width: world.width,
        height: world.height,
      });
    }

    res.json(worldsPayload);
  }));

  router.post('/worlds', jwt(jwtVerifier, async (req, res) => {
    const accountId = req.jwt.aud;
    const user = await accountRepo.findById(accountId);

    if (user === undefined) {
      console.error('accepted invalid token in /worlds, token', accountId);
      res.status(500);
      return;
    }

    const world = await worldRepo.create({
      owner: user,
      width: 100,
      height: 100,
    });

    res.json({ id: world.id });
  }));

  return router;
}