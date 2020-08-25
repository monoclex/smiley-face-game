import Player from "@/game/player/Player";

function hook(player: Player, keyboardEvent: number, onUp: (player: Player) => void, onDown: (player: Player) => void) {
  const keyObj = player.game.input.keyboard.addKey(keyboardEvent);
  keyObj.on("down", () => onUp(player));
  keyObj.on("up", () => onDown(player));
}

export default function connectPlayerToKeyboard(player: Player) {
  const { UP, LEFT, RIGHT, W, A, D, SPACE, E } = Phaser.Input.Keyboard.KeyCodes;

  const jumpOn = (player: Player) => player.character.updateInputs({ jump: true });
  const jumpOff = (player: Player) => player.character.updateInputs({ jump: false });
  const leftOn = (player: Player) => player.character.updateInputs({ left: true });
  const leftOff = (player: Player) => player.character.updateInputs({ left: false });
  const rightOn = (player: Player) => player.character.updateInputs({ right: true });
  const rightOff = (player: Player) => player.character.updateInputs({ right: false });

  hook(player, SPACE, jumpOn, jumpOff);
  hook(player, UP, jumpOn, jumpOff);
  hook(player, W, jumpOn, jumpOff);

  hook(player, LEFT, leftOn, leftOff);
  hook(player, A, leftOn, leftOff);

  hook(player, RIGHT, rightOn, rightOff);
  hook(player, D, rightOn, rightOff);
}