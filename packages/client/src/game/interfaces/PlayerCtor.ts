import Player from "../Player";

export default interface PlayerCtor {
  new (id: number, username: string, isGuest: boolean): Player;
}
