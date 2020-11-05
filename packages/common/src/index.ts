/**
 * @description This file exports all relevant public APIs for smiley face game. Each export has a reason for being exported.
 */

/**
 * `auth` is used to authenticate with the game.
 */
export { auth } from "./auth";

/**
 * `Authentication` is the class that `auth` creates. If a user already has a token, they'd want to construct one of these.
 */
import Authentication from "./Authentication";
export { Authentication };

/**
 * `endpoints` contains some default endpoints. The client will automatically rewrite the host of all of them to
 * localhost or development if need be, so we should expose the endpoints for that very purpose.
 */
export { endpoints } from "./endpoints";

/**
 * `Connection` is the connection that will be used and created by `Authentication` (and is subsequently made from `auth`).
 * This is exposed here so users can include it in their types if the need to.
 */
import Connection from "./Connection";
export { Connection };


/**
 * There are a handful of things that we don't actually want exported, but want available for typing reasons.
 * Here, we export them as `types` so it's impossible for regular javascript to access it (importing by type helps for
 * tree shaking too), but it's still possible for typescript to remain well types. These will be added on a case by
 * case basis.
 */
import type * as z from "zod";
import type { zJoinRequest } from "./ws-api";
export type ZJoinRequest = z.infer<typeof zJoinRequest>;
import type { zRole } from "./misc-zs";
export type ZRole = z.infer<typeof zRole>;
