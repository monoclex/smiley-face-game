//@ts-ignore
const isProduction = process.env.NODE_ENV === "production";
export default isProduction;

export const isSecure = location.protocol === "https:";
export const http = isSecure ? "https" : "http";
export const ws = isSecure ? "wss" : "ws";

class Urls {
  lobby(): string {
    return isProduction ? http + "://api.sirjosh3917.com/smiley-face-game/lobby" : http + "://localhost:8080/lobby";
  }

  connection(roomId: string, width: number = 25, height: number = 25): string {
    return isProduction
      ? ws + `://ws-api.sirjosh3917.com/smiley-face-game/ws/game/${roomId}/${width}/${height}`
      : ws + `://localhost:8080/ws/game/${roomId}/${width}/${height}`;
  }
}

export const api = new Urls();
