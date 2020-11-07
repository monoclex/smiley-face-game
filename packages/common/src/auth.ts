import type { SchemaInput } from "computed-types";
import { endpoints, Endpoint, zEndpoint } from "./endpoints";
import { zLoginReq, zLoginResp, zGuestReq, zGuestResp, zRegisterReq } from "./api";
import fetch from "./fetch";
import Authentication from "./Authentication";

export type AccountCredentials = SchemaInput<typeof zLoginReq>;
export type GuestCredentials = SchemaInput<typeof zGuestReq>;
export type Credentials = AccountCredentials | GuestCredentials;

/**
 * Authenticates a user to Smiley Face Game.
 * @param payload The credentials to use when authenticating.
 * @param endpoint An optional custom endpoint to use during authentication.
 * @returns {Promise<Authentication>} A promise that resolves to an object that can be used to interface with SFG.
 */
export function auth(payload: Credentials, endpoint?: Endpoint): Promise<Authentication>;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export function auth(argPayload: any, argEndpoint?: unknown): Promise<Authentication> {
  if ("email" in argPayload) {
    const payload = zLoginReq.parse(argPayload);
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.auth);

    return fetch(endpoint, payload, zLoginResp).then(payload => new Authentication(payload.token, payload.id));
  }
  else if ("username" in argPayload) {
    const payload = zGuestReq.parse(argPayload);
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.guestAuth);

    return fetch(endpoint, payload, zGuestResp).then(payload => new Authentication(payload.token));
  }
  else throw new Error("Couldn't determine if `auth` payload was a guest or user login request."
    + " Do you have `email` or `username` as one of the keys in `payload`?");
}

/**
 * Registers an account for Smiley Face Game.
 * @param payload The payload to pass to the authentication endpoint.
 * @param endpoint An optional custom endpoint to use during authentication.
 * @returns {Promise<Authentication>} A promise that resolves to an object that can be used to interface with SFG.
 */
export function register(payload: SchemaInput<typeof zRegisterReq>, endpoint?: Endpoint): Promise<Authentication>;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export function register(argPayload: unknown, argEndpoint?: unknown): Promise<Authentication> {
  const payload = zRegisterReq.parse(argPayload);
  const endpoint = zEndpoint.parse(argEndpoint || endpoints.register);

  return fetch(endpoint, payload, zLoginResp).then(payload => new Authentication(payload.token, payload.id));
}
