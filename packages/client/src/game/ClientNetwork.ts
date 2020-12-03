import { Connection } from "@smiley-face-game/api";
import Game from "./Game";
import Network from "./Network";
import defaultInputs from "./defaultInputs";
import Inputs from "./Inputs";
import areSame from "./areSame";

export default class ClientNetwork implements Network {
  private mainPlayerOldInputs: Inputs = defaultInputs();

  constructor(private readonly connection: Connection) {}

  update(game: Game): void {
    if (!areSame(game.self.input, this.mainPlayerOldInputs)) {
      this.connection.move(game.self.position, game.self.velocity, game.self.input);
      this.mainPlayerOldInputs = { ...game.self.input };
    }
  }
}
