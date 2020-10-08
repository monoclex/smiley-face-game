import Component from "../../../game/components/Component";
import TileManager from "../../../game/world/TileManager";
import LayerDisplay from "./LayerDisplay";
import LayerType from "./LayerType";

export default class Layer implements Component {
  readonly display: LayerDisplay;

  constructor(tileManager: TileManager, layer: LayerType) {
    this.display = new LayerDisplay(tileManager, layer);
  }
}
