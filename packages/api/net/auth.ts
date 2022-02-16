import type { SchemaInput } from "computed-types";
import { endpoints, Endpoint, zEndpoint } from "./endpoints";
import { zLoginReq, zTokenResp, zGuestReq, zRegisterReq } from "../api";
import fetch from "../fetch";
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
export async function auth(argPayload: unknown, argEndpoint?: unknown): Promise<Authentication> {
  if (typeof argPayload !== "object") throw new Error("auth got non object for payloaad");
  if (argPayload === null) throw new Error("auth got null for payloaad");

  let payloadParser;
  let defaultEndpoint;
  if ("email" in argPayload) {
    payloadParser = zLoginReq;
    defaultEndpoint = endpoints.auth;
  } else if ("username" in argPayload) {
    payloadParser = zGuestReq;
    defaultEndpoint = endpoints.guestAuth;
  } else
    throw new Error(
      "Couldn't determine if `auth` payload was a guest or user login request." +
        " Do you have `email` or `username` as one of the keys in `payload`?"
    );

  const payload = payloadParser.parse(argPayload);
  const endpoint = zEndpoint.parse(argEndpoint || defaultEndpoint);

  const response = await fetch(endpoint, payload, zTokenResp);
  if ("error" in response) throw new Error(`Error from server: ${response.error}`);
  else return new Authentication(response.token);
}

/**
 * Registers an account for Smiley Face Game.
 * @param payload The payload to pass to the authentication endpoint.
 * @param endpoint An optional custom endpoint to use during authentication.
 * @returns {Promise<Authentication>} A promise that resolves to an object that can be used to interface with SFG.
 */
export function register(
  payload: SchemaInput<typeof zRegisterReq>,
  endpoint?: Endpoint
): Promise<Authentication>;

/** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
export async function register(
  argPayload: unknown,
  argEndpoint?: unknown
): Promise<Authentication> {
  const payload = zRegisterReq.parse(argPayload);
  const endpoint = zEndpoint.parse(argEndpoint || endpoints.register);

  const response = await fetch(endpoint, payload, zTokenResp);
  if ("error" in response) throw new Error(`Error from server: ${response.error}`);
  else return new Authentication(response.token);
}
