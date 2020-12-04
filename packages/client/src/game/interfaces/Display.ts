import Game from "../Game";

export default interface Display {
  draw(game: Game): void;
}
