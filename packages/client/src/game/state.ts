/* eslint-disable @typescript-eslint/no-use-before-define */
import Game from "./Game";
import Player from "./components/Player";
import deep from "fast-deep-equal";

export const statesAreEqual = deep;

export interface GameState {
  players: PlayerState[];
}

export interface PlayerState {
  username: string;
  role: "non" | "edit" | "staff" | "owner"; // TODO: remove role in favor of permission based stuff
}

export function captureGameState(game: Game): GameState {
  const players: PlayerState[] = [];

  for (const player of game.players) {
    players.push(capturePlayerState(player));
  }

  return { players };
}

export function capturePlayerState(player: Player): PlayerState {
  return {
    username: player.username,
    role: player.role,
  };
}
