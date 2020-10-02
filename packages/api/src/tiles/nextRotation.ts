import { Rotation } from "@smiley-face-game/api/schemas/Rotation";

export default function next(current: Rotation): Rotation {
  switch (current) {
    case Rotation.Up:
      return Rotation.Right;
    case Rotation.Right:
      return Rotation.Down;
    case Rotation.Down:
      return Rotation.Left;
    case Rotation.Left:
      return Rotation.Up;
  }
}
