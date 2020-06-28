import { acceptable, acceptWebSocket, Application, isWebSocketPingEvent, oakCors, Router } from "./deps.ts";
import { validateWorldPacket } from "./libcore/core/networking/game/WorldPacket.ts";
import { isWebSocketCloseEvent } from "./libcore/deps.ts";
import { User } from './worlds/User.ts';
import { ValidMessage } from "./worlds/ValidMessage.ts";
import { WorldManager } from "./worlds/WorldManager.ts";

let uniqueInternalId = 0;
const newId = () => ++uniqueInternalId;

const gameManager = new WorldManager();

const router = new Router();
router.get("/ws/game/:id", async (context) => {
    if (!(context.params && context.params.id)) {
      return;
    }

    if (!acceptable(context.request.serverRequest)) {
      context.response.redirect('/');
      return;
    }
    
    const id = context.params.id;
    const game = await gameManager.openOrCreateGame(id);

    const { conn, r: bufReader, w: bufWriter, headers } = context.request.serverRequest;
    const webSocket = await acceptWebSocket({ conn, bufReader, bufWriter, headers });

    const user = new User(webSocket, newId());

    await game.handleJoin(user);

    try {
      for await (const event of webSocket) {
        if (isWebSocketPingEvent(event)) continue;
        if (isWebSocketCloseEvent(event)) continue;

        if (!(typeof event === 'string')) {
          console.warn('error event isn\'t string', event);
          break;
        }

        const [error, packet] = validateWorldPacket(JSON.parse(event));
        if (error !== null) {
          console.warn('error validating packet: ', error, event);
          break;
        }

        const isValid = await game.handleMessage(user, packet!);
        if (isValid !== ValidMessage.IsValidMessage) {
          console.warn('packet deemed invalid: ', packet);
          break;
        }
      }

      // we broke out of the loop intentionally, something bad happened
      if (!webSocket.isClosed) {
        await webSocket.close();
      }
    } catch (error) {
      console.warn('error handling websocket connection: ', error);
      await webSocket.close();
    }
    finally {
      // TODO: should handleLeave be called before the connection is destroyed?
      await game.handleLeave(user);
    }
  })
  .get("/", (context) => {
    context.response.body = "hello world";
  })
  .get("/lobby", (context) => {
    context.response.body = gameManager.listGames();
  })
;

const app = new Application();
app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

console.log('listening');
await app.listen({ port: 8080 });
console.log('done');
