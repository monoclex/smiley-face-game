import Schema, { boolean, string, SchemaInput, addParse } from "./computed-types-wrapper";

const zSecure = addParse(boolean.optional());

export type Endpoint = SchemaInput<typeof zEndpoint>;
export const zEndpoint = addParse(
  Schema({
    secure: zSecure,
    host: string.min(1),
    path: string.min(1),
  })
);

const host = "api.sirjosh3917.com/smiley-face-game/v1";

const auth: Endpoint = { host, path: "/auth/login" };
const guestAuth: Endpoint = { host, path: "/auth/guest" };
const register: Endpoint = { host, path: "/auth/register" };
const ws: Endpoint = {
  host: "ws-" + host,
  path: "/game/ws/" /* THIS BETTER HAVE A TRAILING SLASH. THE NGINX CONFIG IS SCREWED AND THIS COSTED ME SEVERAL HORUS OF PAIN. */,
};
const lobby: Endpoint = { host, path: "/game/lobby" };
const player: Endpoint = { host, path: "/player" };
export const endpoints = { auth, guestAuth, ws, lobby, player, register };
// work around TS crud: https://fettblog.eu/typescript-better-object-keys/
const endpointKeys: (keyof typeof endpoints)[] = ["auth", "guestAuth", "ws", "lobby", "player", "register"];

export function rewriteHost(rewriter: (endpoint: Endpoint) => Endpoint) {
  for (const endpointId of endpointKeys) {
    endpoints[endpointId] = rewriter(endpoints[endpointId]);
  }
}

export function useDev() {
  rewriteHost((endpoint) =>
    endpoint.host.startsWith("ws")
      ? { ...endpoint, host: "dev-ws-api.sirjosh3917.com/smiley-face-game/v1" }
      : { ...endpoint, host: "api.sirjosh3917.com/smiley-face-game/dev/v1" }
  );
}

const zWebsocket = addParse(boolean);

/**
 * The algorithm used when coercing `secure` in `Endpoint` to a value. The algorithm is as follows:
 *
 * 1. If explicitly specified, use the value.
 * 2. If `location` is defined and if `location.protocol` is insecure, return `false`.
 * 3. Otherwise, return `true`.
 *
 * @package
 * @param secure The value of `secure`
 */
export function coerceSecure(secure: boolean | null | undefined): boolean;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export function coerceSecure(argSecure: unknown): boolean {
  const secure = zSecure.parse(argSecure);
  if (secure === true || secure === false) return secure;

  // in node, just referencing `location` will throw an error
  // so we use `globalThis["location"]` instead which will just return `undefined`, and not throw
  if (globalThis["location"] && location.protocol === "http:") return false;
  return true;
}

/**
 * Converts an `Endpoint` into a URL. The implementation of this method shouldn't be relied upon as it changes, but it
 * will use `coerceSecure` to convert the optional `secure` into `true` or `false`. Then, it'll concatenate the host
 * and path, using `websocket` to determine if it should prefix the URL with ws?:// or http?://.
 * @param endpoint The endpoint to convert into a URL.
 * @returns The endpoint converted to a URL.
 */
export function toUrl(endpoint: Endpoint, websocket: boolean): URL;

/** Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export function toUrl(argEndpoint: unknown, argWebsocket: unknown): URL {
  const endpoint = zEndpoint.parse(argEndpoint);
  const websocket = zWebsocket.parse(argWebsocket);
  const secure = coerceSecure(endpoint.secure);

  const base = (websocket ? "ws" : "http") + (secure ? "s" : "") + "://";
  return new URL(base + endpoint.host + endpoint.path);
}
