import { createBrowserHistory, History, LocationState } from "history";

type Request<TRequest, TPayload> = { request: TRequest } & TPayload;
type HistoryState = null | Request<"join", JoinRoomRequest> | Request<"create", CreateRoomRequest>;

interface JoinRoomRequest {
  roomId: string;
  type: "dynamic" | "saved";
}

interface CreateRoomRequest {
  name: string;
  width: number;
  height: number;
}

interface ModifiedHistory<S = HistoryState> extends History<S> {
  home(): void;
  lobby(): void;
  joinGame(options: JoinRoomRequest): void;
  createGame(options: CreateRoomRequest): void;
}

const history = createBrowserHistory<HistoryState>();

const modifiedHistory: ModifiedHistory = {
  ...history,
  home: () => {
    history.push({
      pathname: "/",
      state: null,
    });
  },
  lobby: () => {
    history.push({
      pathname: "/lobby",
      state: null,
    });
  },
  joinGame: (options) => {
    history.push({
      pathname: `/games/${options.roomId}`,
      state: { ...options, request: "join" },
    });
  },
  createGame: (options) => {
    history.push({
      pathname: `/games/`,
      state: { ...options, request: "create" },
    });
  },
};

export default modifiedHistory;
