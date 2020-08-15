import { Router } from "express";
import Dependencies from "@/dependencies";

console.warn("[COMPAT-DEV.TS] INCLUDED");
console.warn("COMAT-DEV.TS SHOULD ONLY BE INCLUDED DURING THE MIGRATION OF THE OLD FRONTEND CODE TO BE COMPATIBLE WITH THE NEW BACKEND");

export default function (router: Router, deps: Dependencies) {
  router.use('/lobby', (_, res) => {
    let previews = [];

    for (const room of deps.roomManager.listRooms()) {
      previews.push({
        id: room.id,
        playerCount: 1, // room.players.length,
      });
    }

    res.json(previews);
  })
}