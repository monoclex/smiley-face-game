import { validateWorldPacket } from '@smiley-face-game/api/src/networking/game/WorldPacket';
import { Router } from "express";
import * as WebSocket from 'ws';
import { applyTo } from "../../../expressapp";
import { AllowJoin } from "../../../worlds/AllowJoin";
import { WorldUser } from '../../../worlds/User';
import { ValidMessage } from "../../../worlds/ValidMessage";
import roomManager from "../../../worlds/WorldManager";

const router = Router();
applyTo(router);

router.ws('/:id', async (ws, req) => {
  const { id } = req.params;
  if (!id) return;

  await handleWebsocketConnection(ws, {
    id,
    width: 25,
    height: 25
  });
});

router.ws('/:id/:width/:height', async (ws, req) => {
  const { id, width, height } = req.params;
  if (!id || !width || !height) return;

  await handleWebsocketConnection(ws, {
    id,
    width: clamp(parseIntHelper(width, 25), 0, 50),
    height: clamp(parseIntHelper(height, 25), 0, 50),
  });
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseIntHelper(input: string, defaultValue: number): number {
  const parsed = parseInt(input);

  if (typeof parsed === undefined || isNaN(parsed)) {
    return defaultValue;
  }

  return parsed;
}

interface WebsocketConnectionOptions {
  readonly id: string;
  readonly width: number;
  readonly height: number;
}

async function handleWebsocketConnection(webSocket: WebSocket, options: WebsocketConnectionOptions) {
  const room = await roomManager.openOrCreateGame(options.id, options.width, options.height);

  const user = new WorldUser(webSocket, room.newId++);

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

export default router;