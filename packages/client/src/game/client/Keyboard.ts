import Player from "../components/Player";

function handleKey(player: Player, key: string, pressed: boolean) {
  switch (key) {
    case "w":
      player.input.up = pressed;
      break;
    case "d":
      player.input.right = pressed;
      break;
    case "a":
      player.input.left = pressed;
      break;
    case "s":
      player.input.down = pressed;
      break;
    case " ": // space
      player.input.jump = pressed;
      break;
    case "e":
      if (pressed) {
        player.holdGun(!player.isGunHeld);
      }
      break;
  }
}

export default class Keyboard {
  constructor(player: Player) {
    // TODO: do this nicely? (inside of ClientGame)
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      handleKey(player, key, true);
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      handleKey(player, key, false);
    });
  }
}
