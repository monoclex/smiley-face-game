import cors from "cors";
import express from 'express';
import expressWs from 'express-ws';
import * as WebSocket from 'ws';
import { validateWorldPacket } from "../common/networking/game/WorldPacket";
import { User } from "./worlds/User";
import { ValidMessage } from "./worlds/ValidMessage";
import { WorldManager } from './worlds/WorldManager';

const { app } = expressWs(express());

app.use(cors());

let uniqueInternalId = 0;
const newId = () => ++uniqueInternalId;

const gameManager = new WorldManager();

app.ws('/ws/game/:id', async (ws, req) => {
  const { id, width, height } = req.params;
  if (!id) return;

  await handleWebsocketConnection(ws, id, (width ? parseInt(width) : 25), (height ? parseInt(height) : 25));
});

app.ws('/ws/game/:id/:width/:height', async (ws, req) => {
  const { id, width, height } = req.params;
  if (!id) return;

  await handleWebsocketConnection(ws, id, (width ? parseInt(width) : 25), (height ? parseInt(height) : 25));
});

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

async function handleWebsocketConnection(webSocket: WebSocket, id: string, width: number, height: number) {
  width = clamp(width, 0, 50);
  height = clamp(height, 0, 50);

  const game = await gameManager.openOrCreateGame(id, width, height);

  const user = new User(webSocket, newId());

  await game.handleJoin(user);

  webSocket.on('message', async (data) => {
    try {
      if (typeof data !== 'string') {
        console.warn('non string data sent on websocket');
        webSocket.close();
        return;
      }

      const [error, packet] = validateWorldPacket(JSON.parse(data));
      if (error !== null) {
        console.warn('error validating packet: ', error, event);
        return;
      }

      const isValid = await game.handleMessage(user, packet);
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
    await game.handleLeave(user);
  });
}

app.get('/', (req, res) => {
  console.log('cool');
  res.contentType('text/plain');
  res.send('hello world!');
});

app.get('/lobby', (req, res) => {
  console.log('lobby');
  res.send([]);
});

app.listen(8080, () => console.log('listening'));

// app.get("/ws/game/:id", async (context) => {
//     if (!(context.params && context.params.id)) {
//       return;
//     }

//     if (!acceptable(context.request.serverRequest)) {
//       context.response.redirect('/');
//       return;
//     }

//     const id = context.params.id;
//     const game = await gameManager.openOrCreateGame(id);

//     const { conn, r: bufReader, w: bufWriter, headers } = context.request.serverRequest;
//     const webSocket = await acceptWebSocket({ conn, bufReader, bufWriter, headers });

//     const user = new User(webSocket, newId());

//     await game.handleJoin(user);

//     try {
//       for await (const event of webSocket) {
//         if (isWebSocketPingEvent(event)) continue;
//         if (isWebSocketCloseEvent(event)) continue;

//         if (!(typeof event === 'string')) {
//           console.warn('error event isn\'t string', event);
//           break;
//         }

//         const [error, packet] = validateWorldPacket(JSON.parse(event));
//         if (error !== null) {
//           console.warn('error validating packet: ', error, event);
//           break;
//         }

//         const isValid = await game.handleMessage(user, packet!);
//         if (isValid !== ValidMessage.IsValidMessage) {
//           console.warn('packet deemed invalid: ', packet);
//           break;
//         }
//       }

//       // we broke out of the loop intentionally, something bad happened
//       if (!webSocket.isClosed) {
//         await webSocket.close();
//       }
//     } catch (error) {
//       console.warn('error handling websocket connection: ', error);
//       await webSocket.close();
//     }
//     finally {
//       // TODO: should handleLeave be called before the connection is destroyed?
//       await game.handleLeave(user);
//     }
//   })
//   .get("/", (context) => {
//     context.response.body = "hello world";
//   })
//   .get("/lobby", (context) => {
//     context.response.body = gameManager.listGames();
//   })
// ;

// const app = new Application();
// app.use(oakCors());
// app.use(router.routes());
// app.use(router.allowedMethods());

// console.log('listening');
// await app.listen({ port: 8080 });
// console.log('done');
