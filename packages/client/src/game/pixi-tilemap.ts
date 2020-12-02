// pixi-tilemap is a special snowflake and badly needs `PIXI` to exist as a
// global the ordering of these imports is ***special***
//
// this imports `PIXI` and sets it as a global so you can import
// `pixi-tilemap` properly, making sure to only import the things needed.
// (i checked source)
import { utils } from "pixi.js";
window.PIXI = {
  //@ts-ignore
  utils: {
    createIndicesForQuads: utils.createIndicesForQuads,
  },
  CanvasRenderer: class {
    constructor() {
      alert("oh noes");
      throw new Error("pixi canvasrender shouldn't be called");
    }
  },
};
export * from "pixi-tilemap";
