import { Connection } from "@smiley-face-game/api";
import Game from "../Game";
import defaultInputs from "../helpers/defaultInputs";
import Inputs from "../interfaces/Inputs";
import areSame from "../helpers/areSame";

export default class ClientNetwork {
  private mainPlayerOldInputs: Inputs = defaultInputs();

  constructor(private readonly connection: Connection) {}

  update(game: Game): void {
    if (!areSame(game.self.input, this.mainPlayerOldInputs)) {
      this.connection.move(game.self.position, game.self.velocity, game.self.input);
      this.mainPlayerOldInputs = { ...game.self.input };
    }
  }
}
