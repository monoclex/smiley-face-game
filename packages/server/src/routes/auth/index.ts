import { Router } from "express";
import Schema from "computed-types";
import { UsernameSchema } from '@smiley-face-game/api/schemas/Username';
import { EmailSchema } from "@smiley-face-game/api/schemas/Email";
import { PasswordSchema } from "@smiley-face-game/api/schemas/Password";
import schema from "@/middlewares/schema";
import Dependencies from "@/dependencies";

// TODO: should put schemas in a schema place & import them
const RegisterSchema = Schema({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});
const validateRegister = RegisterSchema.destruct();

const LoginSchema = Schema.either({
  username: UsernameSchema,
  password: PasswordSchema,
}, {
  email: EmailSchema,
  password: PasswordSchema,
});
const validateLogin = LoginSchema.destruct();

export default function (deps: Dependencies): Router {
  const { accountRepo, jwtProvider } = deps;

  const router = Router();

  // TODO: should clean up steps a little

  router.post('/login', schema(validateLogin, async (req, res) => {
    const body = req.body;

    try {
      // TODO: abstract this into its own thing
      const account = "username" in body ? await accountRepo.findByUsername(body.username) : await accountRepo.findByEmail(body.email);

      if (!await accountRepo.verifyPassword(account, body.password)) {
        throw new Error("Passwords don't match.");
      }

      const token = jwtProvider.allowAuthentication(account.id);

      res.status(200).json({ token });
      return;
    } catch (error) {
      res.status(401).send(error);
      return;
    }
  }));

  router.post('/register', schema(validateRegister, async (req, res) => {
    const body = req.body;

    try {
      await accountRepo.create({
        username: body.username,
        email: body.email,
        password: body.password
      });
    } catch (error) {
      res.status(409).send(error);
      return;
    }

    res.status(200).send({});
    return;
  }));

  return router;
}