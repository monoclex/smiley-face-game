import { Router } from "express";
import jwt from "../../../middlewares/jwt";
import Dependencies from "../../../dependencies";
import { ZShopItem } from "@smiley-face-game/api/types";
import { Category, CategoryType } from "@smiley-face-game/api/enums";

type UsedDependencies = Pick<Dependencies, "authVerifier" | "accountRepo" | "roomManager">;

export default function (deps: UsedDependencies): Router {
  const { authVerifier, accountRepo } = deps;

  const router = Router();

  router.get(
    "/items",
    jwt(authVerifier, async (req, res) => {
      if (req.jwt.aud === "") {
        res.status(400).json({ error: "Cannot load shop items as guest" });
        return;
      }

      const account = await accountRepo.findByIdWithWorlds(req.jwt.aud);

      const items: ZShopItem[] = [
        {
          id: 1,
          title: "200 x 200 World",
          description: "what an epic world",
          imageUrl: "",
          category: Category.World,
          categoryType: CategoryType.None,
          energyCost: 420,
        },
        {
          id: 2,
          title: "Smiley Face",
          description: "omg another circle how epic",
          imageUrl: "",
          category: Category.Character,
          categoryType: CategoryType.Owned,
          energyCost: 123,
        },
        {
          id: 3,
          title: "69 x 420",
          description: "lol, funni number",
          imageUrl: "",
          category: Category.World,
          categoryType: CategoryType.Featured,
          energyCost: 1337,
        },
      ];

      res.json(items);
    })
  );

  return router;
}
