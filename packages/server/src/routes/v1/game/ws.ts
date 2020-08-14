import expressWs from "express-ws";
import * as WebSocket from 'ws';
import { validateWorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";
import JwtPayload from "@/jwt/JwtPayload";
import jwt from "@/middlewares/jwt";
import schema from "@/middlewares/schema";
import { applyTo } from "@/expressapp";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "jwtVerifier" | "roomManager">;

export default async function(router: expressWs.Router, deps: UsedDependencies) {
  const { jwtVerifier, roomManager } = deps;

  applyTo(router);

  router.post("/ws", jwt(jwtVerifier, schema(validateWorldDetails, async (req, res) => {
    // TODO: somehow get the typing above to work nicely, for now this is an alright workaround
    //@ts-expect-error
    const jwt: JwtPayload = req.jwt;
  })));

  router.ws("/ws", async (ws, req) => {
     const { token, world } = req.query;

     
  });
}