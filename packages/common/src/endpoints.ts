import * as z from "zod";

const zSecure = z.boolean().optional();

export type Endpoint = z.infer<typeof zEndpoint>;
export const zEndpoint = z.object({
  secure: zSecure,
  host: z.string().nonempty(),
  path: z.string().nonempty(),
});

const host = "api.sirjosh3917.com/smiley-face-game/v1";

const auth: Endpoint = { host, path: "/auth/login" };
const guestAuth: Endpoint = { host, path: "/auth/guest" };
const ws: Endpoint = { host: "ws-" + host, path: "/game/ws" };
const lobby: Endpoint = { host, path: "/game/lobby" };
const player: Endpoint = { host, path: "/player" };
export const endpoints = { auth, guestAuth, ws, lobby, player };

export function rewriteHost(rewriter: (endpoint: Endpoint) => Endpoint) {
  for (const endpointId of Object.keys(endpoints)) {
    //@ts-ignore
    endpoints[endpointId] = rewriter(endpoints[endpointId]);
  }
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
const zWebsocket = z.boolean();

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
export function coerceSecure(secure: boolean | undefined): boolean;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export function coerceSecure(argSecure: unknown): boolean {
  const secure = zSecure.parse(argSecure);
  if (secure === true || secure === false) return secure;
  if (location && location.protocol === "http:") return false;
  return true;
}
