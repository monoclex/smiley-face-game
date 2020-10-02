import * as core from "express-serve-static-core";
import * as ws from "express-ws";

export default function handleAsync<TRouteHandler extends core.RequestHandler>(
  handler: TRouteHandler
): TRouteHandler;
export default function handleAsync<
  TRouteHandler extends ws.WebsocketRequestHandler
>(handler: TRouteHandler): TRouteHandler;
export default function handleAsync<T>(handler: T): T {
  //@ts-ignore
  return (req, res, next) => {
    //@ts-ignore
    return handler(req, res, next).catch((err) => {
      // in the case of websocket endpoints, `req` is actually `ws` and `res` is `req`
      console.trace(
        "received error in endpoint",
        req.originalUrl || res.originalUrl,
        err
      );
      next(err);
    });
  };
}
