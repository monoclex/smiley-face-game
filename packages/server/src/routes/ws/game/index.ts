import { validateWorldPacket } from '@smiley-face-game/api/src/networking/game/WorldPacket';
import { Router } from "express";
import { Connection } from 'typeorm';
import * as WebSocket from 'ws';
import { applyTo } from "../../../expressapp";
import { verifyJwt } from '../../../middlewares/checkJwt';
import { User } from '../../../models/User';
import { AllowJoin } from "../../../worlds/AllowJoin";
import { WorldUser } from '../../../worlds/User';
import { ValidMessage } from "../../../worlds/ValidMessage";
import roomManager from "../../../worlds/WorldManager";

// TODO: too much logic in here as well

export default function (connection: Connection): Router {
  const users = connection.getRepository(User);

  const router = Router();
  applyTo(router);

  interface WebsocketRouteOptions {
    token: string | undefined;
    width: string | undefined;
    height: string | undefined;
  }

  router.ws('/:id', async (ws, req) => {
    const { id } = req.params;
    const { token, width, height } = req.query as unknown as WebsocketRouteOptions;
    if (!id) return;

    await handleWebsocketConnection(ws, {
      id,
      token,
      width: clamp(parseIntHelper(width, 25), 0, 50),
      height: clamp(parseIntHelper(height, 25), 0, 50),
    });
  });

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  function parseIntHelper(input: string | undefined, defaultValue: number): number {
    if (input === undefined) return defaultValue;

    const parsed = parseInt(input);

    if (typeof parsed === undefined || isNaN(parsed)) {
      return defaultValue;
    }

    return parsed;
  }

  interface WebsocketConnectionOptions {
    readonly id: string;
    readonly token: string | undefined;
    readonly width: number;
    readonly height: number;
  }

  async function handleWebsocketConnection(webSocket: WebSocket, options: WebsocketConnectionOptions) {
    const room = await roomManager.openOrCreateGame(options.id, options.width, options.height);

    let databaseUser: User | undefined = undefined;

    if (typeof options.token !== "undefined") {
      try {
        const tokenBody = await verifyJwt(options.token);

        // TODO: use schemas to confirm that tokenBody's body is type checked
        const userId: string = tokenBody.id as string;
        const user = await users.findOneOrFail({ id: userId });

        databaseUser = user;
      } catch (error) {
        // TODO: remove catch if it is proven that an exception won't break the entire stack
        console.error('error at verifyJwt', error);
        throw error;
      }
    }

    const user = new WorldUser(webSocket, room.newId++, databaseUser);

    const mayJoin = await room.handleJoin(user);
    if (mayJoin === AllowJoin.PreventJoin) return;

    webSocket.on('message', async (data) => {
      try {
        if (typeof data !== 'string') {
          console.warn('non string data sent on websocket');
          webSocket.close();
          return;
        }

        const [error, packet] = validateWorldPacket(JSON.parse(data));
        if (error !== null) {
          console.warn('error validating packet: ', error);
          return;
        }

        const isValid = await room.handleMessage(user, packet);
        if (isValid !== ValidMessage.IsValidMessage) {
          console.warn('packet deemed invalid: ', packet);
          return;
        }
      } catch (error) {
        console.warn('error handling websocket connection: ', error);
        await webSocket.close();
      }
    });

    webSocket.on('close', async () => {
      await room.handleLeave(user);
    });
  }

  return router;
}