import { NetworkClient } from "@smiley-face-game/api/NetworkClient";
import Player from "@/game/player/Player";
import { chat } from "@/recoil/atoms/chat";

function hook(player: Player, keyboardEvent: number, onUp: (player: Player, event: KeyboardEvent, key: Phaser.Input.Keyboard.Key) => void, onDown: (player: Player, event: KeyboardEvent, key: Phaser.Input.Keyboard.Key) => void) {
  // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/keyboardevents/#key-object
  const keyObj = player.game.input.keyboard.addKey(
    // they keyboard event to add a key for
    keyboardEvent,

    // prevent phaser from calling preventDefault() automatically
    // this is so if the chat is active, we can ignore the key press
    false
  );

  // don't touch! down should be up, up should be down, otherwise it's inverted for some reason
  keyObj.on("down", (key) => onUp(player, key.originalEvent, key));
  keyObj.on("up", (key) => onDown(player, key.originalEvent, key));
}

export default function connectPlayerToKeyboard(player: Player, networkClient: NetworkClient) {
  const { UP, LEFT, RIGHT, W, A, D, SPACE, E } = Phaser.Input.Keyboard.KeyCodes;

  // allows us to wrap any (player) => void action and then send a movement packet afterwords
  const sendMovePacket = (closure: (player: Player) => void) => (player: Player, event: KeyboardEvent, key: Phaser.Input.Keyboard.Key) => {
    if (chat.state.isActive) {
      // don't process events when the chat is active
      // even if that means the player presses -> in the chat and ends up going to the right,
      // this is a feature that i personally have used and enjoyed using in EE
    }
    else {
      closure(player);
      networkClient.move(player.body, player.body.body.velocity, player.input);

      if (key.isDown) {
        event.preventDefault();
      }
    }
  };

  const jumpOn = sendMovePacket((player) => player.updateInputs({ jump: true }));
  const jumpOff = sendMovePacket((player) => player.updateInputs({ jump: false }));
  const leftOn = sendMovePacket((player) => player.updateInputs({ left: true }));
  const leftOff = sendMovePacket((player) => player.updateInputs({ left: false }));
  const rightOn = sendMovePacket((player) => player.updateInputs({ right: true }));
  const rightOff = sendMovePacket((player) => player.updateInputs({ right: false }));

  hook(player, SPACE, jumpOn, jumpOff);
  hook(player, UP, jumpOn, jumpOff);
  hook(player, W, jumpOn, jumpOff);

  hook(player, LEFT, leftOn, leftOff);
  hook(player, A, leftOn, leftOff);

  hook(player, RIGHT, rightOn, rightOff);
  hook(player, D, rightOn, rightOff);
}
