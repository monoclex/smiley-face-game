import * as bodyParser from 'body-parser';
import express from "express";
import request from "supertest";
import { Connection, Repository } from 'typeorm';
import { verifyJwt } from '../src/middlewares/checkJwt';
import { User } from '../src/models/User';
import authRouterFactory from "../src/routes/auth";

// lol this is a stupid bad idiot test
test('registers user', async (done) => {
  process.env.ACCESS_TOKEN_SECRET = '69696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969';

  const router = authRouterFactory({
    getRepository: (constructor) => {
      // TODO: eliminate this assertion
      expect(constructor).toBe(User);

      return {
        save: async function (user: User) {
          expect(user.username).toBe('John Doe');
          user.id = 'super cool user ::)';

          return user;
        }
      } as unknown as Repository<User>;
    }
  } as Connection);

  const app = express();
  app.use(bodyParser.json());
  app.use('/', router);

  const response = await request(app).post('/register')
    .send({ username: 'John Doe' });

  expect(response.status).toBe(200);

  done();
});

test('logs user in', async (done) => {
  process.env.ACCESS_TOKEN_SECRET = '69696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969696969';

  const router = authRouterFactory({
    getRepository: (constructor) => {
      // TODO: eliminate this assertion
      expect(constructor).toBe(User);

      return {
        findOneOrFail: async function (clause: any) {
          expect(typeof clause).not.toBe(typeof undefined);
          expect(clause.username).toBe('John Doe');
          const user = new User();
          user.id = 'ecks dee';
          user.username = 'John Doe';
          return user;
        }
      } as unknown as Repository<User>;
    }
  } as Connection);

  const app = express();
  app.use(bodyParser.json());
  app.use('/', router);

  await request(app)
    .post('/login')
    .send({ username: 'John Doe' })
    .set('Accept', 'application/json')
    .expect(200)
    .then(response => {
      expect(typeof response.body.token).toBe(typeof "");
      expect(response.body.token.length).toBeGreaterThan(20);

      return verifyJwt(response.body.token);
    })
    .then(payload => {
      expect(payload.id).toBe('ecks dee');
    });

  done();
});