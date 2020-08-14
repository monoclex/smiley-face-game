import { Router } from "express";
import { validateLogin } from "@smiley-face-game/api/schemas/web/auth/Login";
import { validateRegister } from "@smiley-face-game/api/schemas/web/auth/Register";
import schema from "@/middlewares/schema";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "accountRepo" | "authProvider">;

export default function (deps: UsedDependencies): Router {
  const { accountRepo, authProvider } = deps;

  const router = Router();

  router.post('/login', schema(validateLogin, async (req, res) => {
    const body = req.body;

    try {
      const account = await accountRepo.findByEmail(body.email);

      if (!await accountRepo.verifyPassword(account, body.password)) {
        throw new Error("Passwords don't match.");
      }

      // TODO: move this outside the try catch?
      const token = authProvider.allowAuthentication(account.id);
  
      res.json({ token });
    } catch (error) {
      console.warn("Authentication attempt failed for user", body.email, error);
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

    res.status(201).json({ id: account.id });
  }));

  return router;
}