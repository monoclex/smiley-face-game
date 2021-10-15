import { DisplayObject } from "pixi.js";
import { CompositeRectTileLayer } from "@pixi/tilemap";

export default function newCompositeRectTileLayer(zIndex?: number, bitmaps?: any[]): CompositeRectTileLayer & DisplayObject {
  // for some reason, pixi-tilemap compositerecttilelayers are valid
  // DisplayObjects but because pixi-tilemap imports @pixi/things instead of
  // pixi.js, it doesn't have valid typings for whatever reason... hacky
  // workarounds ftw!
  // @ts-ignore
  return new CompositeRectTileLayer(zIndex, bitmaps);
}
