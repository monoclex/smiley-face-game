import Player from "../components/Player";

export default class Keyboard {
  constructor(player: Player) {
    // TODO: do this nicely? (inside of ClientGame)
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      console.log("press", key);

      switch (key) {
        case "w":
          player.input.up = true;
          break;
        case "d":
          player.input.right = true;
          break;
        case "a":
          player.input.left = true;
          break;
        case "s":
          player.input.down = true;
          break;
        case " ": // space
          player.input.jump = true;
          break;
      }
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();

      switch (key) {
        case "w":
          player.input.up = !true;
          break;
        case "d":
          player.input.right = !true;
          break;
        case "a":
          player.input.left = !true;
          break;
        case "s":
          player.input.down = !true;
          break;
        case " ": // space
          player.input.jump = !true;
          break;
      }
    });
  }
}
