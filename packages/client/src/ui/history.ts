import { createBrowserHistory, History } from "history";
import type { ZJoinRequest } from "@smiley-face-game/api/ws-api";

export type HistoryState = ZJoinRequest;

interface ModifiedHistory<S = HistoryState> extends History<S> {
  home(): void;
  lobby(): void;
  joinGame(id: string): void;
  createGame(name: string, width: number, height: number): void;
}

const history = createBrowserHistory<HistoryState>();

const modifiedHistory: ModifiedHistory = {
  ...history,
  home: () => {
    history.push({
      pathname: "/",
      state: undefined,
    });
  },
  lobby: () => {
    history.push({
      pathname: "/lobby",
      state: undefined,
    });
  },
  joinGame: (id) => {
    history.push({
      pathname: `/games/${id}`,
      state: { type: "join", id },
    });
  },
  createGame: (name, width, height) => {
    history.push({
      pathname: `/games/loading`,
      state: { type: "create", name, width, height },
    });
  },
};

export default modifiedHistory;
