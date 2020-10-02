// whilst I would've loved to use full names like "version", "audience", "permissions", e.t.c rather than the abbreviated forms "ver", "aud",
// and "can", it fits more the JWT style to shorten these claims into 3 letters.

/**
 * The JwtPayload is an interface that describes what the payload of a JWT can possibly be. This enables code to be strongly typed when
 * dealing with the JWT, which will prevent errors and bugs.
 */
export default interface AuthPayload {
  /**
   * The version the payload is on. Every time this interface is changed and the change is deployed, this counter must increment to signal
   * that payloads with a lesser version number are to be invalidated.
   *
   * By invalidating older JwtPayloads, this prevents bugs from arising as all property accesses are guaranteed to work.
   *
   * For example, if an older JwtPayload had field "a" of type number and "b" of type string, and a newer JwtPayload had a field "a" of type
   * string and "c" of type string, accesses to field "a" being a string may cause some hidden bugs that are hard to find, and not having
   * field "c" be accessible may also cause some problems.
   * By using a statically incrementing version counter, this provides a very good way to quickly short circuit if older, stale data is
   * possibly encountered.
   */
  readonly ver: 1;

  /**
   * The JWT "aud" (Audience) Claim: https://tools.ietf.org/html/rfc7519#section-4.1.3
   *
   * The audience will be the Account Id of an Account.
   * If no Account Id is specified (""), then this user is a Guest.
   */
  readonly aud: string | "";

  /**
   * If the current user is a Guest, this field may have a name, hinting at their preferred name.
   * If the user has an account, this field is to be ignored and treated as if it were undefined.
   */
  readonly name?: string;

  /**
   * The permissions that this token is good for.
   *
   * `play` - this permission allows connecting to worlds in to the game.
   * `shop` - this permission allows purchasing items from the shop.
   */
  readonly can: ("play" | "shop")[];
}
