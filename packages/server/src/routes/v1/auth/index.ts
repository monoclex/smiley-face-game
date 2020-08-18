import { Router } from "express";
import { validateLogin } from "@smiley-face-game/api/schemas/web/auth/Login";
import { validateRegister } from "@smiley-face-game/api/schemas/web/auth/Register";
import { validateGuest } from "@smiley-face-game/api/schemas/web/auth/Guest";
import schema from "@/middlewares/schema";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "accountRepo" | "authProvider" | "worldRepo">;

export default function (deps: UsedDependencies): Router {
  const { accountRepo, worldRepo, authProvider } = deps;

  const router = Router();

  // TODO: should there be some kind of timeout so that this isn't susceptible to timing attacks from people
  // guessing emails and seeing if something works (verifyPassword is not susceptible to timing attacks, just findByEmail)
  router.post('/login', schema(validateLogin, async (req, res) => {
    const body = req.body;

    try {
      const account = await accountRepo.findByEmail(body.email);

      if (!await accountRepo.verifyPassword(account, body.password)) {
        throw new Error("Passwords don't match.");
      }

      // TODO: move this outside the try catch?
      const token = authProvider.allowAuthentication(account.id);
  
      res.json({ token, id: account.id });
    } catch (error) {
      console.warn("Authentication attempt failed for user", body.email, error);
      res.status(400);
    }
  }));

  router.post('/register', schema(validateRegister, async (req, res) => {
    const body = req.body;

    // TODO: verify captcha

    const account = await accountRepo.create({
      username: body.username,
      email: body.email,
      password: body.password
    });

    // give registered users a world to save/load/play
    const world = await worldRepo.create({
      owner: account,
      width: 50,
      height: 50,
    });

    account.worlds.push(world);
    await accountRepo.save(account);

    const token = authProvider.allowAuthentication(account.id);

    res.status(201).json({ token, id: account.id });
  }));

  router.post('/guest', schema(validateGuest, async (req, res) => {
    const body = req.body;

    const token = authProvider.allowGuestAuthentication(body.username);
    res.json({ token });
  }))

  return router;
}