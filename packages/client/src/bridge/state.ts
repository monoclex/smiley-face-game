import type { Connection, Game } from "@smiley-face-game/api";
import type { Player } from "@smiley-face-game/api/physics/Player";
import type ClientBlockBar from "./ClientBlockBar";
import type Keyboard from "./Keyboard";
import type GameRenderer from "./rendering/GameRenderer";

export default {} as {
  game?: Game;
  connection?: Connection;
  gameRenderer?: GameRenderer;
  keyboard?: Keyboard;
  blockBar?: ClientBlockBar;
  self?: Player;
};
