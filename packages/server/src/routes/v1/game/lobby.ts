import { Router } from "express";
import asyncHandler from "../../../middlewares/asyncHandler";
import jwt from "../../../middlewares/jwt";
import Dependencies from "../../../dependencies";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "roomManager">;

export default async function (router: Router, deps: UsedDependencies) {
  const { authVerifier, roomManager } = deps;

  router.get(
    "/lobby",
    jwt(
      authVerifier,
      asyncHandler(async (_, res) => {
        const previews = [];

        // TODO: depending on the verification level of the JWT, display hidden/visible/e.t.c rooms
        for (const { room } of roomManager.listRooms()) {
          previews.push({
            id: room.id,
            name: room.name,
            playerCount: room.playerCount,
          });
        }

        res.json(previews);
      })
    )
  );
}
