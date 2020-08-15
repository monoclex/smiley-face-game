import expressWs from "express-ws";
import * as WebSocket from 'ws';
import { validateWorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";
import { WorldDetails } from "@smiley-face-game/api/schemas/web/game/ws/WorldDetails";
import AuthPayload from "@/jwt/payloads/AuthPayload";
import canJoinWorld from "@/jwt/permissions/canJoinWorld";
import extractJwt from "@/jwt/extractJwt";
import jwt from "@/middlewares/jwt";
import schema from "@/middlewares/schema";
import Room from "@/worlds/Room";
import RoomManager from "@/worlds/RoomManager";
import { applyTo } from "@/expressapp";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "worldProvider" | "worldVerifier" | "roomManager">;

export default function(router: expressWs.Router, deps: UsedDependencies) {
  const { authVerifier, worldProvider, worldVerifier, roomManager } = deps;

  applyTo(router);

  router.post("/ws", jwt(authVerifier, schema(validateWorldDetails, async (req, res) => {
    // TODO: somehow get the typing above to work nicely, for now this is an alright workaround
    //@ts-expect-error
    const jwt: AuthPayload = req.jwt;

    // TODO: this pattern will get annoying to write, need to have a smaller helper function
    if (!canJoinWorld(jwt)) {
      throw new Error("Missing permission to play.");
    }

    if (req.body.type === "saved") {
      res.json({ token: worldProvider.joinSaved(req.body.id) });
    }
    else if (req.body.type === "dynamic") {
      res.json({ token: worldProvider.joinDynamic(req.body.name, req.body.width, req.body.height) });
    }
    else {
      throw new Error("unexpected type");
    }
  })));

  router.ws("/ws", async (ws, req) => {
    const { token, world } = req.query;

    if (typeof token !== "string" || typeof world !== "string") {
      throw new Error("`token`/`world` must be a string token.");
    }

    const authToken = extractJwt(authVerifier, token);
    const worldToken = extractJwt(worldVerifier, world);

    if (!canJoinWorld(authToken)) {
      throw new Error("Missing permission to play.");
    }

    return roomManager.join(undefined, worldToken.det);
  });
}