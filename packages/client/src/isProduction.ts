import { WorldJoinRequest } from "@smiley-face-game/schemas/web";
import { Guest } from "@smiley-face-game/schemas/web";
import { Register } from "@smiley-face-game/schemas/web";
import { Login } from "@smiley-face-game/schemas/web";

const isProduction = process.env.NODE_ENV === "production";
export default isProduction;

export const isDev = process.env.DEV === true;
const isSecure = location.protocol === "https:";
const http = isSecure ? "https" : "http";
const ws = isSecure ? "wss" : "ws";

interface GlobalVariableParkourType {
  token: string;
  type?: "saved" | "dynamic";
  name?: string;
  width?: number;
  height?: number;
  id?: string;
  onId?: (id: string) => void;
}

class Urls {
  private baseUrl(): string {
    return (
      http +
      (isProduction ? `://api.sirjosh3917.com/smiley-face-game${isDev ? "/dev" : ""}` : "://localhost:8080") +
      "/v1"
    );
  }

  private post<T>(url: string, body: T): Promise<Response> {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  lobby(): string {
    return this.baseUrl() + "/game/lobby";
  }

  player(): string {
    return this.baseUrl() + "/player";
  }

  getLobby(token: string): Promise<any> {
    return fetch(this.lobby(), {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }).then((result) => {
      if (!result.ok) throw new Error("Couldn't GET lobby.");
      return result.json();
    });
  }

  getMyRooms(token: string): Promise<any> {
    return fetch(this.player(), {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }).then((result) => {
      if (!result.ok) throw new Error("Couldn't GET player.");
      return result.json();
    });
  }

  connection(options: GlobalVariableParkourType): string {
    let joinRequest: WorldJoinRequest;

    if (options.id) {
      //@ts-ignore
      joinRequest = { type: options.type!, id: options.id };
    } else {
      joinRequest = { type: "dynamic", name: options.name!, width: options.width!, height: options.height! };
    }

    const query = `token=${encodeURIComponent(options.token)}&world=${encodeURIComponent(JSON.stringify(joinRequest))}`;

    return isProduction
      ? ws + `://${isDev ? "dev-" : ""}ws-api.sirjosh3917.com/smiley-face-game/v1/game/ws/?${query}`
      : ws + `://localhost:8080/v1/game/ws/?${query}`;
  }

  auth(): string {
    return this.baseUrl() + "/auth";
  }

  authGuest(): string {
    return this.auth() + "/guest";
  }

  postAuthGuest(username: string): Promise<Response> {
    return this.post<Guest>(this.authGuest(), { username });
  }

  register(): string {
    return this.auth() + "/register";
  }

  postRegister(username: string, email: string, password: string): Promise<Response> {
    return this.post<Register>(this.register(), { username, email, password });
  }

  login(): string {
    return this.auth() + "/login";
  }

  postLogin(email: string, password: string): Promise<Response> {
    return this.post<Login>(this.login(), { email, password });
  }
}

export const api = new Urls();
