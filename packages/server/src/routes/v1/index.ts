import { Router } from "express";
import asyncHandler from "../../middlewares/asyncHandler";
import Dependencies from "../../dependencies";
import authRouterFactory from "./auth";
import gameRouterFactory from "./game";
import playerRouterFactory from "./player";

export default function (deps: Dependencies): Router {
  const router = Router();

  router.use("/auth", authRouterFactory(deps));
  router.use("/game", gameRouterFactory(deps));
  router.use("/player", playerRouterFactory(deps));
  router.get(
    "/err",
    asyncHandler(() => {
      return new Promise((_, rj) => {
        setTimeout(() => {
          rj(new Error("async errer"));
        }, 1000);
      });
    })
  );

  return router;
}
