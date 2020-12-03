import Game from "./Game";

export default interface Network {
  update(game: Game): void;
}
