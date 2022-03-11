import { Game } from "@smiley-face-game/api";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { TileLayer } from "@smiley-face-game/api/types";
import AuthoredBlockPlacer from "../AuthoredBlockPlacer";
import { signOpen } from "../inputEnabled";
import { gameQuestioner } from "../Questions";

export default function onSign(
  game: Game,
  placer: AuthoredBlockPlacer,
  layer: TileLayer,
  position: Vector,
  id: number
) {
  signOpen.value = true;

  gameQuestioner.ask("signText").then((text) => {
    signOpen.value = false;

    if (!text) return;
    placer.place(layer, undefined, position, id, { kind: "sign", text });
  });
}
