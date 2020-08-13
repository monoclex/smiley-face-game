import { UsernameSchema } from '@smiley-face-game/api/schemas/Username';
import Schema from 'computed-types';
import cors from "cors";
import { Router } from "express";
import * as jwt from 'jsonwebtoken';
import { Connection } from "typeorm";
import { EmailSchema } from '../../../../api/src/schemas/Email';
import { PasswordSchema } from '../../../../api/src/schemas/Password';
import User from '../../database/models/Account';
import Dependencies from "../../dependencies";

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
  const { accountRepo } = deps;

  const router = Router();

  // TODO: it may be best to not send stack traces of errors to users in the future
  // TODO: too much domain logic here, controllers should *only* verify input and ask something else to handle proper input

  router.post('/login', cors(), async (req, res) => {
    const [errors, body] = validateLogin(req.body);
    if (errors !== null || body === undefined) {
      res.status(422).send(errors);
      return;
    }

    try {
      // TODO: abstract this into its own thing
      const user = "username" in body ? await accountRepo.findByUsername(body.username) : await accountRepo.findByEmail(body.email);

      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: "1 day"
        }
      );

      res.status(200).json({ token });
      return;
    } catch (error) {
      res.status(401).send(error);
      return;
    }
  });

  router.post('/register', cors(), async (req, res) => {
    console.log('body: ', req.body);
    const [errors, body] = validateRegister(req.body);
    if (errors !== null || body === undefined) {
      res.status(422).send(errors);
      return;
    }

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
  });

  return router;
}