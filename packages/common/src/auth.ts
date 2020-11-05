import * as z from "zod";
import { endpoints, Endpoint, zEndpoint } from "./endpoints";
import { zLoginReq, zLoginResp } from "./api";
import fetch from "./fetch";
import Authentication from "./Authentication";

export type Credentials = z.infer<typeof zLoginReq>;

/**
 * Authenticates a user to Smiley Face Game.
 * @param payload The credentials to use when authenticating.
 * @param endpoint An optional custom endpoint to use for authentication.
 * @returns {Promise<Authentication>} A promise that resolves to an object that can be used to interface with SFG.
 */
export function auth(payload: Credentials, endpoint?: Endpoint): Promise<Authentication>;

/** Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export function auth(argPayload: unknown, argEndpoint?: unknown): Promise<Authentication> {
  const payload = zLoginReq.parse(argPayload);
  const endpoint = zEndpoint.parse(argEndpoint || endpoints.auth);

  return fetch(endpoint, payload, zLoginResp).then(payload => new Authentication(payload.token));
}
