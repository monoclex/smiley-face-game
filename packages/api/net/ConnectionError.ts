/**
 * A derived error that is thrown so that callees can explicitly check if the
 * error was a connection error via `instanceof`
 */
export default class ConnectionError extends Error {
  constructor(message: string) {
    super("Failed to connect to websocket endpoint: " + message);
    this.name = ConnectionError.name;
  }
}
