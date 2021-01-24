/* eslint-disable @typescript-eslint/no-use-before-define */
import Game from "./Game";
import Player from "./components/Player";
import deep from "fast-deep-equal";
import Message from "./interfaces/Message";

/**
 * The state system is useful for knowing about differences in states between ticks. It can
 * be considered expensive, so it's not enabled by default.
 */
export default class StateSystem {
  private previousState?: GameState;

  onStateDifference?: (state: GameState) => void;

  /**
   * Returns if the state system is enabled and doing computations.
   * This is only true if there is a callback to handle on a state difference.
   */
  get enabled(): boolean {
    return Boolean(this.onStateDifference);
  }

  tick(game: Game) {
    if (!this.enabled) return;

    const state = captureGameState(game);

    if (statesAreEqual(this.previousState, state)) return;

    this.previousState = state;

    if (this.onStateDifference) {
      this.onStateDifference(state);
    }
  }
}

export const statesAreEqual = deep;

export interface GameState {
  self: PlayerState;
  players: PlayerState[];
  messages: MessageState[];
}

export interface PlayerState {
  id: number;
  username: string;
  role: "non" | "edit" | "staff" | "owner"; // TODO: remove role in favor of permission based stuff
}

export interface MessageState {
  id: number;
  time: Date;
  sender: PlayerState;
  content: string;
}

export function captureGameState(game: Game, previous?: GameState): GameState {
  const players: PlayerState[] = [];
  const playerCache: Map<number, PlayerState> = new Map();

  for (const player of game.players) {
    const state = capturePlayerState(player);
    players.push(state);
    playerCache.set(player.id, state);
  }

  // sort it so that the first element is the newest player
  players.sort((a, b) => b.id - a.id);

  let messages: MessageState[] = [];

  // for performance, it'd be really bad to iterate over the same thousands of messages
  // each tick. to speed it up, we re-use the old elements
  const canReusePrevious = previous && previous.messages.length > 0 && game.chat.messages.length > 0;
  if (!canReusePrevious) {
    for (const message of game.chat.messages) {
      messages.push(captureMessageState(message));
    }
  } else {
    const prevMsgs = previous!.messages;
    const gameMsgs = game.chat.messages;

    const sharedStart = Math.max(prevMsgs[0].id, prevMsgs[0].id);
    const sharedEnd = Math.min(prevMsgs[gameMsgs.length - 1].id, prevMsgs[prevMsgs.length - 1].id);

    let startIndex: number, endIndex: number;
    for (let i = 0; i < prevMsgs.length; i++) {
      if (prevMsgs[i].id !== sharedStart) continue;
      startIndex = i;
      break;
    }

    for (let i = prevMsgs.length - 1; i >= 0; i--) {
      if (prevMsgs[i].id !== sharedEnd) continue;
      endIndex = i;
      break;
    }

    //@ts-ignore
    if (!startIndex || !endIndex) throw new Error("didn't find wat");

    const shared = prevMsgs.slice(startIndex, endIndex);

    const start = [];

    for (let i = 0; i < gameMsgs.length; i++) {
      const message = gameMsgs[i];

      if (message.id === sharedStart) break;

      start.push(captureMessageState(message, playerCache));
    }

    const end = [];

    for (let i = gameMsgs.length - 1; i >= 0; i--) {
      const message = gameMsgs[i];

      if (message.id === sharedEnd) break;

      end.push(captureMessageState(message, playerCache));
    }

    messages = start.concat(...shared).concat(...end);
  }

  return { self: capturePlayerState(game.self), players, messages };
}

// suppose to be only `Player` but it's PlayerState so you can pass anythign *like* a PlayerState
export function capturePlayerState(player: Player | PlayerState): PlayerState {
  return {
    id: player.id,
    username: player.username,
    role: player.role,
  };
}

export function captureMessageState(message: Message, playerCache?: Map<number, PlayerState>): MessageState {
  function senderAsPlayerState(sender: PlayerState, playerCache?: Map<number, PlayerState>) {
    if (playerCache) {
      const cachedPlayer = playerCache.get(sender.id);
      if (cachedPlayer) return cachedPlayer;
      console.warn("player not cached", sender);
    }

    return capturePlayerState(sender);
  }

  return {
    id: message.id,
    time: message.time,
    sender: senderAsPlayerState(message.sender, playerCache),
    content: message.content,
  };
}
