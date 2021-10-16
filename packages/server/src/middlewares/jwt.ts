import { RequestHandler, Request, Response, NextFunction } from "express";
import type * as core from "express-serve-static-core";
import extractJwt from "../jwt/extractJwt";
import JwtVerifier from "../jwt/JwtVerifier";

type JwtHandler<TPayload, P extends core.Params = core.ParamsDictionary, ResBody = unknown, ReqBody = unknown, ReqQuery = core.Query> = (
  req: Request<P, ResBody, ReqBody, ReqQuery> & { jwt: TPayload },
  res: Response<ResBody>,
  next: NextFunction
) => unknown;

/**
 * Offers a strongly typed way to apply a "proxy" middleware to the request pipeline to make accessing JWT payload easier.
 *
 * The reason that this is not just a simple middleware is because it is highly type unsafe to do so, whereas proxying the request handler
 * (as this middleware does) offers a better way to typecheck.
 * @param verifier The JwtVerifier to use when verifying JWT tokens.
 * @param jwtHandler The handler to run when a valid JWT token is passed.
 */
export default function jwt<
  TPayload,
  P extends core.Params = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = core.Query
>(
  verifier: JwtVerifier<TPayload>,
  jwtHandler: JwtHandler<TPayload, P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    const token = req.headers.authorization;

    const payload = extractJwt(verifier, token);

    //@ts-expect-error it's very complicated to type this properly, so we just
    // set `jwt` here
    req.jwt = payload;

    //@ts-expect-error the only missing field is `jwt`, which is set above
    return jwtHandler(req, res, next);
  };
}
