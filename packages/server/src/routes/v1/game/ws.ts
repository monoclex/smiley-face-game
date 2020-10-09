import expressWs from "express-ws";
import { validateWorldJoinRequest } from "@smiley-face-game/schemas/web/game/ws/WorldJoinRequest";
import canJoinWorld from "../../../jwt/permissions/canJoinWorld";
import extractJwt from "../../../jwt/extractJwt";
import asyncHandler from "../../../middlewares/asyncHandler";
import Connection from "../../../worlds/Connection";
import { applyTo } from "../../../expressapp";
import Dependencies from "../../../dependencies";

type UsedDependencies = Pick<
  Dependencies,
  "authVerifier" | "roomManager" | "accountRepo"
>;

export default function (router: expressWs.Router, deps: UsedDependencies) {
  const { authVerifier, roomManager, accountRepo } = deps;

  applyTo(router);

  router.ws(
    "/ws",
    asyncHandler<expressWs.WebsocketRequestHandler>(async (ws, req) => {
      const { token, world } = req.query;

      try {
        if (typeof token !== "string" || typeof world !== "string") {
          throw new Error("`token`/`world` must be a string token.");
        }

        const authTokenPayload = extractJwt(authVerifier, token);

        if (!canJoinWorld(authTokenPayload)) {
          throw new Error("Missing permission to play.");
        }

        const [errors, worldTokenPayload] = validateWorldJoinRequest(
          JSON.parse(world)
        );
        if (errors !== null || worldTokenPayload === undefined) {
          throw new Error("Failed to validate WorldDetails payload.");
        }

        const connection = new Connection(
          ws,
          authTokenPayload,
          worldTokenPayload
        );

        await connection.load(accountRepo);
        const room = await roomManager.join(connection, worldTokenPayload);
        await connection.play(room);
      } catch (err) {
        ws.send(JSON.stringify({ error: err.toString() }));
      } finally {
        if (ws.readyState === ws.OPEN) {
          ws.close();
        }
      }
    })
  );
}
