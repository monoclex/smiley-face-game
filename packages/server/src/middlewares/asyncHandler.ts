import * as core from "express-serve-static-core";
import * as ws from "express-ws";

export default function handleAsync<TRouteHandler extends core.RequestHandler>(handler: TRouteHandler): TRouteHandler;
export default function handleAsync<TRouteHandler extends ws.WebsocketRequestHandler>(handler: TRouteHandler): TRouteHandler;
export default function handleAsync<T>(handler: T): T {
  //@ts-ignore
  return (req, res, next) => {
    //@ts-ignore
    return handler(req, res, next).catch(err => {
      console.trace("received error in endpoint", req.originalUrl, err);
      next(err);
    });
  };
}