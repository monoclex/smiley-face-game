import * as z from "zod";
import { endpoints, Endpoint, zEndpoint } from "./endpoints";
import { zLoginReq, zLoginResp, zGuestReq, zGuestResp } from "./api";
import fetch from "./fetch";
import Authentication from "./Authentication";

export type AccountCredentials = z.infer<typeof zLoginReq>;
export type GuestCredentials = z.infer<typeof zGuestReq>;
export type Credentials = AccountCredentials | GuestCredentials;

/**
 * Authenticates a user to Smiley Face Game.
 * @param payload The credentials to use when authenticating.
 * @param endpoint An optional custom endpoint to use for authentication.
 * @returns {Promise<Authentication>} A promise that resolves to an object that can be used to interface with SFG.
 */
export function auth(payload: Credentials, endpoint?: Endpoint): Promise<Authentication>;

/** Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
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
