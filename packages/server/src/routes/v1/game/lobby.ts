import { Router } from "express";
import jwt from "@/middlewares/jwt";
import Dependencies from "@/dependencies";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "roomManager">;

export default async function(router: Router, deps: UsedDependencies) {
  const { authVerifier, roomManager } = deps;

  router.get("/lobby", jwt(authVerifier, async (req, res) => {
    let previews = [];

    // TODO: depending on the verification level of the JWT, display hidden/visible/e.t.c rooms
    for (const room of roomManager.listRooms()) {
      previews.push({
        id: room.id,
        // TODO: add these properties to room
        //@ts-expect-error
        name: room.name,
        //@ts-expect-error
        playerCount: room.players.length,
      })
    }

    res.json(previews);
  }));
}