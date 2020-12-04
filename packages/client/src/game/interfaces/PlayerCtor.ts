import Player from "../components/Player";

export default interface PlayerCtor {
  new (id: number, username: string, isGuest: boolean): Player;
}
