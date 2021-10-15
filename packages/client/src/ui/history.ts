import { createBrowserHistory, History } from "history";
import type { ZJoinRequest } from "@smiley-face-game/api/ws-api";

export type HistoryState = ZJoinRequest;

interface ModifiedHistory<S = HistoryState> extends History<S> {
  home(): void;
  lobby(): void;
  joinGame(id: string): void;
  createGame(name: string, width: number, height: number): void;
}

const history = createBrowserHistory();

const modifiedHistory: ModifiedHistory = {
  ...history,
  home: () => {
    history.push({ pathname: "/" }, undefined);
  },
  lobby: () => {
    history.push({ pathname: "/lobby" }, undefined);
  },
  joinGame: (id) => {
    history.push({ pathname: `/games/${id}` }, { type: "join", id });
  },
  createGame: (name, width, height) => {
    history.push({ pathname: `/games/loading` }, { type: "create", name, width, height });
  },
};

export default modifiedHistory;
