import Player from "../components/Player";

export default interface Message {
  // id is for react
  id: number;
  time: Date;
  sender: Pick<Player, "id" | "role" | "username">;
  content: string;
}
