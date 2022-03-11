import { currentSwitchId } from "@/state";
import { Game } from "@smiley-face-game/api";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { TileLayer } from "@smiley-face-game/api/types";
import AuthoredBlockPlacer from "../AuthoredBlockPlacer";

// TODO(efficiency): make it so that placing a switch doesn't involve sending 2 packets
export default function onSwitch(
  game: Game,
  placer: AuthoredBlockPlacer,
  layer: TileLayer,
  position: Vector,
  id: number
) {
  placer.place(layer, undefined, position, id, { kind: "switch", id: currentSwitchId.value });
}
