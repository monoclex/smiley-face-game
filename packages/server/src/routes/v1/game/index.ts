import { Router } from "express";
import Dependencies from "@/dependencies";
import lobby from "./lobby";
import ws from "./ws";

export default function (deps: Dependencies): Router {
  const router = Router();

  lobby(router, deps);
  ws(router, deps);

  return router;
}
