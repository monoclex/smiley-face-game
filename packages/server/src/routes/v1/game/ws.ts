import expressWs from "express-ws";
import { zJoinRequest } from "@smiley-face-game/api/ws-api";
import canJoinWorld from "../../../jwt/permissions/canJoinWorld";
import extractJwt from "../../../jwt/extractJwt";
import asyncHandler from "../../../middlewares/asyncHandler";
import Connection from "../../../worlds/Connection";
import { applyTo } from "../../../expressapp";
import Dependencies from "../../../dependencies";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "roomManager" | "accountRepo">;

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

        const worldTokenPayload = zJoinRequest.parse(JSON.parse(world));
        // const [errors, worldTokenPayload] = validateWorldJoinRequest(JSON.parse(world));
        // if (errors !== null || worldTokenPayload === undefined) {
        //   throw new Error("Failed to validate WorldDetails payload.");
        // }

        const connection = new Connection(ws, authTokenPayload, worldTokenPayload);

        await connection.load(accountRepo);
        const room = await roomManager.join(connection, worldTokenPayload);
        await connection.play(room);
      } catch (err) {
        let payload;
        if (typeof err === "object" && err !== null) {
          payload = err.toString();
        } else {
          payload = "" + err;
        }

        const INTERNAL_SERVER_ERROR = 1011; // https://github.com/Luka967/websocket-close-codes
        ws.close(INTERNAL_SERVER_ERROR, payload);
      } finally {
        if (ws.readyState === ws.OPEN) {
          ws.close();
        }
      }
    })
  );
}
