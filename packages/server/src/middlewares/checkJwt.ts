import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export function verifyJwt<TJWTPayload extends Record<string, unknown>>(token: string): Promise<TJWTPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(decoded as TJWTPayload);
      }
    });
  });
}

export function verifyJwtMiddleware(request: Request, response: Response, next: NextFunction): void {
  const token: string | undefined = request.headers.authorization;

  if (typeof token === "undefined") {
    response.status(401).send("no token in 'authorization'");
    return;
  }

  verifyJwt(token)
    .then(data => {
      next();
    })
    .catch(err => {
      response.status(401).send(err);
    });
}