import { UsernameSchema } from '@smiley-face-game/api/schemas/Username';
import Schema from 'computed-types';
import cors from "cors";
import { Router } from "express";
import { EmailSchema } from '../../../../api/src/schemas/Email';
import { PasswordSchema } from '../../../../api/src/schemas/Password';
import Dependencies from "../../dependencies";
import schema from "@/middlewares/schema.js";

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

  // TODO: it may be best to not send stack traces of errors to users in the future
  // TODO: too much domain logic here, controllers should *only* verify input and ask something else to handle proper input

  router.post('/login', cors(), schema(validateLogin, async (req, res) => {
    const body = req.body;

    try {
      // TODO: abstract this into its own thing
      const account = "username" in body ? await accountRepo.findByUsername(body.username) : await accountRepo.findByEmail(body.email);

      const token = jwtProvider.allowAuthentication(account.id);

      res.status(200).json({ token });
      return;
    } catch (error) {
      res.status(401).send(error);
      return;
    }
  }));

  router.post('/register', cors(), schema(validateRegister, async (req, res) => {
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