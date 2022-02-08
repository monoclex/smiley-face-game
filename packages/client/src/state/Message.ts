import { CheapPlayer } from "@smiley-face-game/api/physics/Player";

export default interface Message {
  // id is for react
  id: number;
  time: Date;
  sender: CheapPlayer;
  content: string;
}
