import { zJoinRequest } from "./ws-api";
import { zLobbyResp, zPlayerResp } from "./api";
import Connection from "./Connection";
import { zToken, zAccountId } from "./types";
import { endpoints, Endpoint, zEndpoint } from "./endpoints";
import fetch from "./fetch";
import type { SchemaInput } from "./computed-types-wrapper";

/**
 * The `Authentication` class represents an authenticated user. It provides methods that query the game for
 * information.
 */
export default class Authentication {
  /**
   * The JWT of the currently authenticated user. It's not recommended to use this manually, but you can if need be.
   */
  public readonly token: string;

  /**
   * The ID of the account, if the account is logged in as an account.
   */
  public readonly id?: string;

  /**
   * Creates a new `Authentication`. If you don't have a token, call the `auth` method instead.
   * @param token The token to use for authenticating with Smiley Face Game
   */
  constructor(token: string, id?: string);

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  constructor(token: unknown, id?: unknown) {
    this.token = zToken.parse(token);
    if (id) this.id = zAccountId.parse(id);
  }

  /**
   * Attempts to join a world, given the join request.
   * @param joinRequest The request for the world to join.
   * @param endpoint An optional custom endpoint to use for connecting.
   * @returns A promise that resolves to a `Connection`, which can be used to control your in game player.
   */
  connect(joinRequest: SchemaInput<typeof zJoinRequest>, endpoint?: Endpoint): Promise<Connection>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  connect(argJoinRequest: unknown, argEndpoint?: unknown): Promise<Connection> {
    const joinRequest = zJoinRequest.parse(argJoinRequest);
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.ws);
    return Connection.establish(endpoint, this.token, joinRequest);
  }

  /**
   * Attempts to list the lobby as it is visible to the current player.
   * @param endpoint An optional custom endpoint to use for making the request.
   * @returns A promise that resolves to the response of the API when making a lobby request.
   */
  lobby(endpoint?: Endpoint): Promise<SchemaInput<typeof zLobbyResp>>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  lobby(argEndpoint?: unknown): Promise<SchemaInput<typeof zLobbyResp>> {
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.lobby);
    return fetch(endpoint, undefined, zLobbyResp, this.token, "GET");
  }

  /**
   * Attempts to list information about the current player.
   * @param endpoint An optional custom endpoint to use for making the request.
   * @returns A promise that resolves to the response of the API when making a request for the current player.
   */
  player(endpoint?: Endpoint): Promise<SchemaInput<typeof zPlayerResp>>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  player(argEndpoint?: Endpoint): Promise<SchemaInput<typeof zPlayerResp>> {
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.player);
    return fetch(endpoint, undefined, zPlayerResp, this.token, "GET");
  }
}
