import { Game } from "@smiley-face-game/api";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { TileLayer } from "@smiley-face-game/api/types";
import { signGlobal, text } from "../../state/signDialog";
import AuthoredBlockPlacer from "../AuthoredBlockPlacer";

function openDialog(): Promise<string> {
  signGlobal.modify({ open: true });
  return text.it.handle;
}

export default function onSign(
  game: Game,
  placer: AuthoredBlockPlacer,
  layer: TileLayer,
  position: Vector,
  id: number
) {
  openDialog()
    .then((text) => {
      placer.place(layer, undefined, position, id, { kind: "sign", text });
    })
    .catch(console.warn);
}
