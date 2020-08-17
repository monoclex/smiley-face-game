import { Router } from "express";
import jwt from "@/middlewares/jwt";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "roomManager">;

export default async function(router: Router, deps: UsedDependencies) {
  const { authVerifier, roomManager } = deps;

  router.get("/lobby", jwt(authVerifier, async (req, res) => {
    let previews = [];

    // TODO: depending on the verification level of the JWT, display hidden/visible/e.t.c rooms
    for (const { room, type } of roomManager.listRooms()) {
      previews.push({
        type,
        id: room.id,
        name: room.name,
        playerCount: room.playerCount,
      })
    }

    res.json(previews);
  }));
}