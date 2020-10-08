import { Color } from "@smiley-face-game/schemas/Color";

export default function nextColor(current: Color): Color {
  switch (current) {
    case undefined:
    case "white": return "black";
    case "black": return "brown";
    case "brown": return "red";
    case "red": return "orange";
    case "orange": return "yellow";
    case "yellow": return "green";
    case "green": return "blue";
    case "blue": return "purple";
    case "purple": return undefined;
  }
}
