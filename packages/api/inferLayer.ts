import { TileLayer } from "./types";
import TileRegistration from "./tiles/TileRegistration";

export default function inferLayer(tiles: TileRegistration, id: number): TileLayer {
  // const behavior = tiles.for(id);
  // if (behavior instanceof EmptyBehavior) return TileLayer.Foreground; // best guess
  // if (behavior instanceof SolidBehavior) return TileLayer.Foreground;
  // if (behavior instanceof GunBehavior) return TileLayer.Action;
  // if (behavior instanceof ArrowBehavior) return TileLayer.Action;
  // if (behavior instanceof BoostBehavior) return TileLayer.Action;
  // if (behavior instanceof KeysBehavior) {
  //   if (tiles.texture(id) === "keys-red-key") return TileLayer.Action;
  //   else return TileLayer.Foreground;
  // }
  // if (behavior instanceof ZoostBehavior) return TileLayer.Action;
  throw new Error("can't infer tile layer " + id);
}
