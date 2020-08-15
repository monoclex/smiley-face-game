import { Router } from "express";
import Dependencies from "@/dependencies";
import v1RouterFactory from "./v1";
import compatDev from "./compat-dev";

export default function (deps: Dependencies): Router {
  const router = Router();

  router.use('/v1', v1RouterFactory(deps));
  compatDev(router, deps);

  return router;
}