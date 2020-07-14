import { Router } from "express";
import roomManager from "../../worlds/WorldManager";

const router = Router();

router.get('/', (req, res) => {
  res.json(roomManager.listGames());
});

export default router;