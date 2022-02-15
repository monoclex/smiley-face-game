import { Texture } from "pixi.js";

export default interface Resolver {
  get(name: string): Texture | undefined;
}
