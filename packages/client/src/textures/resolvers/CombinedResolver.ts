import { Texture, Resource } from "pixi.js";
import Resolver from "./Resolver";

/**
 * Tries multiple resolvers in succession.
 */
export default class CombinedResolver implements Resolver {
  private readonly resolvers: Resolver[];

  constructor(...resolvers: Resolver[]) {
    this.resolvers = resolvers;
  }

  get(name: string): Texture<Resource> | undefined {
    for (const resolver of this.resolvers) {
      const result = resolver.get(name);
      if (result !== undefined) return result;
    }

    return undefined;
  }
}
