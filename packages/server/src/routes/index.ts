import { Router } from "express";
import lobbyRouter from "./lobby";
import wsGameRouter from "./ws/game";

const router = Router();

router.use('/ws/game', wsGameRouter);
router.use('/lobby', lobbyRouter);

export default router;