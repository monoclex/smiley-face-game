import InputPipe from "./InputPipe";

type ValidKey =
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowDown"
  | "ArrowRight"
  | "W"
  | "w"
  | "A"
  | "a"
  | "S"
  | "s"
  | "D"
  | "d"
  | "E"
  | "e"
  | " ";

interface KeyboardState {
  arrowup?: boolean;
  arrowleft?: boolean;
  arrowdown?: boolean;
  arrowright?: boolean;
  w?: boolean;
  a?: boolean;
  s?: boolean;
  d?: boolean;
  [" "]?: boolean;
}

function handleKey(state: KeyboardState, key: ValidKey | string, modifier: -1 | 1) {
  const desiredState = modifier === 1;

  const keyLower = key.toLowerCase();

  //@ts-ignore
  if (!!state[keyLower] === desiredState) return;
  //@ts-ignore
  state[keyLower] = desiredState;

  switch (key) {
    case "ArrowUp":
      InputPipe.addJump(modifier);
      break;
    case "ArrowLeft":
      InputPipe.addLeft(modifier);
      break;
    // case "ArrowDown": InputPipe.addDown(modifier); break;
    case "ArrowRight":
      InputPipe.addRight(modifier);
      break;
    case "w":
      InputPipe.addJump(modifier);
      break;
    case "a":
      InputPipe.addLeft(modifier);
      break;
    // case "s": InputPipe.addDown(modifier); break;
    case "d":
      InputPipe.addRight(modifier);
      break;
    case " ":
      InputPipe.addJump(modifier);
      break;
    default:
      return;
  }
}

export default function registerKeyboard() {
  const state: KeyboardState = {};

  document.addEventListener("keydown", ({ key }) => handleKey(state, key, 1));
  document.addEventListener("keyup", ({ key }) => handleKey(state, key, -1));
  document.addEventListener("keypress", ({ key }) => {
    if (key === "e" || key === "E") {
      console.log("setting equip");
      InputPipe.equip = true;
    }
  });
}
