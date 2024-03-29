import { zJoinRequest } from "../ws-api";
import {
  ZLobbyResp,
  zLobbyResp,
  ZPlayerResp,
  zPlayerResp,
  ZShopBuyReq,
  zShopBuyResp,
  ZShopBuyResp,
  ZShopItemsResp,
  zShopItemsResp,
} from "../api";
import Connection from "./Connection";
import { zToken, zAccountId } from "../types";
import { endpoints, Endpoint, zEndpoint } from "./endpoints";
import fetch from "../fetch";
import { addParse, SchemaInput } from "../computed-types-wrapper";
import { boolean } from "computed-types";

const zBoolean = addParse(boolean);

/**
 * The `Authentication` class represents an authenticated user. It provides methods that query the game for
 * information.
 */
export default class Authentication {
  /**
   * The JWT of the currently authenticated user. It's not recommended to use this manually, but you can if need be.
   */
  public readonly token: string;

  private _idCached: string | undefined | null = null;

  /**
   * The ID of the account, if the account is logged in as an account.
   */
  get id(): string | undefined {
    if (this._idCached !== null) return this._idCached;

    // TODO: use a polyfill for `atob`?
    const data = JSON.parse(atob(this.token.split(".")[1]));

    if (typeof data.aud === "string" && data.aud.length > 0) {
      this._idCached = zAccountId.parse(data.aud);
    } else {
      this._idCached = undefined;
    }

    return this._idCached;
  }

  /**
   * Determines if the token given is a guest token.
   */
  get isGuest(): boolean {
    return this.id === undefined;
  }

  /**
   * Creates a new `Authentication`. If you don't have a token, call the `auth` method instead.
   * @param token The token to use for authenticating with Smiley Face Game
   */
  constructor(token: string);

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  constructor(token: unknown) {
    this.token = zToken.parse(token);
  }

  /**
   * Attempts to join a world, given the join request.
   * @param joinRequest The request for the world to join.
   * @param endpoint An optional custom endpoint to use for connecting.
   * @param extraChecks Whether or not to perform additional checks on packets sent to/from the server.
   * @returns A promise that resolves to a `Connection`, which can be used to control your in game player.
   */
  connect(
    joinRequest: SchemaInput<typeof zJoinRequest>,
    endpoint?: Endpoint,
    extraChecks?: boolean
  ): Promise<Connection>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  connect(
    argJoinRequest: unknown,
    argEndpoint?: unknown,
    argExtraChecks?: unknown
  ): Promise<Connection> {
    const joinRequest = zJoinRequest.parse(argJoinRequest);
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.ws);
    const extraChecks = typeof argExtraChecks === "boolean" ? zBoolean.parse(argExtraChecks) : true;
    return Connection.establish(endpoint, this.token, joinRequest, extraChecks);
  }

  /**
   * Attempts to list the lobby as it is visible to the current player.
   * @param endpoint An optional custom endpoint to use for making the request.
   * @returns A promise that resolves to the response of the API when making a lobby request.
   */
  lobby(endpoint?: Endpoint): Promise<ZLobbyResp>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  lobby(argEndpoint?: unknown): Promise<ZLobbyResp> {
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.lobby);
    return fetch(endpoint, undefined, zLobbyResp, this.token, "GET");
  }

  /**
   * Attempts to list information about the current player.
   * @param endpoint An optional custom endpoint to use for making the request.
   * @returns A promise that resolves to the response of the API when making a request for the current player.
   */
  player(endpoint?: Endpoint): Promise<ZPlayerResp>;

  /** @package Implementation method that manually sanitizes parameters to prevent callers from javascript passing invalid args. */
  player(argEndpoint?: unknown): Promise<ZPlayerResp> {
    const endpoint = zEndpoint.parse(argEndpoint || endpoints.player);
    return fetch(endpoint, undefined, zPlayerResp, this.token, "GET");
  }

  /**
   * Lists the items in the shop this player has.
   * @param endpoint An optional custom endpoint to use for making the request
   * @throws If the current account is a guest, this will throw an exception.
   * @returns A promise that resolves to the response of the API, a list of shop items.
   */
  shopItems(endpoint?: Endpoint): Promise<ZShopItemsResp> {
    if (this.isGuest) throw new Error("cannot list shop items for guest");
    const parsedEndpoint = zEndpoint.parse(endpoint || endpoints.shopItems);
    return fetch(parsedEndpoint, undefined, zShopItemsResp, this.token, "GET");
  }

  /**
   * Spends energy in the shop.
   * @param item The item to buy.
   * @param endpoint An optional endpoint to use when making the request.
   * @returns A promise that resolves to the bought item response.
   */
  buy(item: ZShopBuyReq, endpoint?: Endpoint): Promise<ZShopBuyResp> {
    if (this.isGuest) throw new Error("cannot buy shop items as guest");
    const parsedEndpoint = zEndpoint.parse(endpoint || endpoints.shopBuy);
    return fetch(parsedEndpoint, item, zShopBuyResp, this.token, "POST");
  }
}
