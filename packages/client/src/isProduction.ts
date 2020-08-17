import { Guest } from "@smiley-face-game/api/schemas/web/auth/Guest";
import { Register } from "@smiley-face-game/api/schemas/web/auth/Register";
import { Login } from "@smiley-face-game/api/schemas/web/auth/Login";
//@ts-ignore
const isProduction = process.env.NODE_ENV === "production";
export default isProduction;

export const isSecure = location.protocol === "https:";
export const http = isSecure ? "https" : "http";
export const ws = isSecure ? "wss" : "ws";

class Urls {
  private baseUrl(): string {
    return http + (isProduction ? "://api.sirjosh3917.com/smiley-face-game" : "://localhost:8080") + "/v1";
  }

  private post<T>(url: string, body: T): Promise<Response> {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  lobby(): string {
    return this.baseUrl() + "/game/lobby";
  }

  getLobby(token: string): Promise<any> {
    return fetch(this.lobby(), {
      method: "GET",
      headers: {
        "Authorization": token
      }
    }).then(result => result.ok && result.json());
  }

  connection(roomId: string, width = 25, height = 25): string {
    return isProduction
      ? ws + `://ws-api.sirjosh3917.com/smiley-face-game/ws/game/${roomId}?width=${width}&height=${height}`
      : ws + `://localhost:8080/ws/game/${roomId}?width=${width}&height=${height}`;
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
