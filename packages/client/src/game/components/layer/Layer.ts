import TileManager from "../../../game/world/TileManager";
import LayerDisplay from "./LayerDisplay";
import LayerType from "./LayerType";

export default class Layer {
  readonly display: LayerDisplay;

  constructor(tileManager: TileManager, layer: LayerType) {
    this.display = new LayerDisplay(tileManager, layer);
  }
}
