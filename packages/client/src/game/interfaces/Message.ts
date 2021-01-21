import Player from "../components/Player";

export default interface Message {
  // id is for react
  id: number;
  time: Date;
  // TODO: don't use `Player` so that the GC can pick up old players, use a
  // smaller version of `Player` that carries enough information about the
  // player to render them (e.g. role/name is all)
  sender: Player;
  content: string;
}
