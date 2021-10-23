import type * as core from "express-serve-static-core";
import * as ws from "express-ws";
import AuthPayload from "../jwt/payloads/AuthPayload";
import { JwtHandler } from "./jwt";

function handleAsync<TRouteHandler extends core.RequestHandler>(handler: TRouteHandler): TRouteHandler;
function handleAsync<TRouteHandler extends ws.WebsocketRequestHandler>(handler: TRouteHandler): TRouteHandler;
function handleAsync<A extends { originalUrl: string }, B extends { originalUrl: string }, C extends (arg: unknown) => void, D>(
  handler: (req: A, res: B, next: C) => Promise<D>
): (req: A, res: B, next: C) => void {
  return (req, res, next) => {
    return handler(req, res, next).catch((err) => {
      // in the case of websocket endpoints, `req` is actually `ws` and `res` is `req`
      console.trace("received error in endpoint", req.originalUrl || res.originalUrl, err);
      next(err);
    });
  };
}

export function handleJwtAsync<
  H extends JwtHandler<TPayload, P, ResBody, ReqBody, ReqQuery>,
  TPayload = AuthPayload,
  P extends core.Params = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = core.Query
>(handler: H): H {
  //@ts-expect-error typing this is hella cringe tbh
  return handleAsync(handler);
}

export default handleAsync;
