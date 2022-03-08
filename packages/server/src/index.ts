import { TileLayer } from "@smiley-face-game/api";
import { WorldLayer } from "@smiley-face-game/api/game/WorldLayer";
import createRegistration from "@smiley-face-game/api/tiles/createRegistration";

host.greet("me :)");

const tiles = createRegistration();

function generateBlankWorld(width: number, height: number): string {
  const world = new WorldLayer(0);
  world.putBorder(width, height, TileLayer.Foreground, tiles.id("basic-white"));
  return JSON.stringify(world.state);
}

function helloWorld(): string {
  return "Hello, World!";
}

const markUsed = (..._: any[]) => {};
markUsed(generateBlankWorld, helloWorld);
