import { Router } from "express";
import Dependencies from "../dependencies";
import v1RouterFactory from "./v1";

export default function (deps: Dependencies): Router {
  const router = Router();

  router.use("/v1", v1RouterFactory(deps));

  return router;
}
