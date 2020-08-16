import expressWs from "express-ws";
import * as WebSocket from 'ws';
import { validateWorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import { WorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import AuthPayload from "@/jwt/payloads/AuthPayload";
import canJoinWorld from "@/jwt/permissions/canJoinWorld";
import extractJwt from "@/jwt/extractJwt";
import jwt from "@/middlewares/jwt";
import schema from "@/middlewares/schema";
import Room from "@/worlds/Room";
import RoomManager from "@/worlds/RoomManager";
import { applyTo } from "@/expressapp";
import Dependencies from "@/dependencies";
import Connection from "@/worlds/Connection";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "worldProvider" | "worldVerifier" | "roomManager">;

export default function(router: expressWs.Router, deps: UsedDependencies) {
  const { authVerifier, worldProvider, worldVerifier, roomManager } = deps;

  applyTo(router);

  router.ws("/ws", async (ws, req) => {
    const { token, world } = req.query;

    if (typeof token !== "string" || typeof world !== "string") {
      throw new Error("`token`/`world` must be a string token.");
    }

    const authTokenPayload = extractJwt(authVerifier, token);
    
    if (!canJoinWorld(authTokenPayload)) {
      throw new Error("Missing permission to play.");
    }

    const [errors, worldTokenPayload] = validateWorldJoinRequest(JSON.parse(world));
    if (errors !== null || worldTokenPayload === undefined) {
      throw new Error("Failed to validate WorldDetails payload.");
    }

    const connection = new Connection(ws, authTokenPayload, worldTokenPayload);
    const room = await roomManager.join(connection, worldTokenPayload);

    await connection.play(room);
  });
}