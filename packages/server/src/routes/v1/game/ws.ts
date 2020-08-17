import expressWs from "express-ws";
import { validateWorldJoinRequest } from "@smiley-face-game/api/schemas/web/game/ws/WorldJoinRequest";
import canJoinWorld from "@/jwt/permissions/canJoinWorld";
import extractJwt from "@/jwt/extractJwt";
import { applyTo } from "@/expressapp";
import Dependencies from "@/dependencies";
import Connection from "@/worlds/Connection";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "roomManager" | "accountRepo">;

export default function(router: expressWs.Router, deps: UsedDependencies) {
  const { authVerifier, roomManager, accountRepo } = deps;

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

    await connection.load(accountRepo);
    const room = await roomManager.join(connection, worldTokenPayload);
    connection.play(room);
  });
}