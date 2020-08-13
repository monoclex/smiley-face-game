import { RequestHandler } from "express";
import * as core from "express-serve-static-core";

/**
 * Offers a strongly typed way to ensure that the body of a request is of a given schema. This will use the validator specified, (which
 * should be generated using "computed-types" `Schema`) and automatically send any validation errors to the client.
 * 
 * @param validator The validator to use to check if the body is correctly typed.
 * @param handler The request handler to call if the body is correctly typed.
 */
export default function schema<ReqBody, P extends core.Params = core.ParamsDictionary, ResBody = any, ReqQuery = core.Query>(
  validator: (input: any) => [any, ReqBody?],
  handler: RequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler {
  return (req, res, next) => {
    
    const [errors, body] = validator(req.body);

    if (errors !== null || body === undefined) {
      res.send(422).send(errors);
      return;
    }

    req.body = body;

    //@ts-expect-error
    return handler(req, res, next);
  };
}