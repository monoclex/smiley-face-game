/**
 * `auth` is used to authenticate with the game. It is the primary entry point for all SFG actions.
 * `register` is used to register an account. Whilst not being a primary entry point, it is useful to the client.
 */
export { auth, register } from "./auth";

/**
 * `Authentication` is the class that `auth` creates. If a user already has a token, they'd want to construct one of these.
 */
import Authentication from "./Authentication";
export { Authentication };

/**
 * `endpoints` contains some default endpoints. The client will automatically rewrite the host of all of them to
 * localhost or development if need be, so we should expose the endpoints for that very purpose.
 * `useDev` is so people can easily set the endpoints being used for the sfg dev server.
 */
export { endpoints, useDev } from "./endpoints";

/**
 * `Connection` is the connection that will be used and created by `Authentication` (and is subsequently made from `auth`).
 * This is exposed here so users can include it in their types if the need to.
 */
import Connection from "./Connection";
export { Connection };
