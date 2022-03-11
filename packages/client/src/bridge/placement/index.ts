import { Game } from "@smiley-face-game/api";
import { Player } from "@smiley-face-game/api/physics/Player";
import { Vector } from "@smiley-face-game/api/physics/Vector";
import { HeapKind } from "@smiley-face-game/api/tiles/TileRegistration";
import { TileLayer } from "@smiley-face-game/api/types";
import AuthoredBlockPlacer from "../AuthoredBlockPlacer";
import onSign from "./onSign";
import onSwitch from "./onSwitch";

interface PlacementFunction {
  (
    game: Game,
    placer: AuthoredBlockPlacer,
    layer: TileLayer,
    position: Vector,
    id: number,
    author: Player
  ): void;
}

const placements: { [K in Exclude<HeapKind, HeapKind.None>]: PlacementFunction } = {
  [HeapKind.Sign]: onSign,
  [HeapKind.Switch]: onSwitch,
};

export default placements;
