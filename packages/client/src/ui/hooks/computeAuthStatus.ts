// TODO: this shouldn't be in `hooks` lol
import { Authentication } from "@smiley-face-game/api";
import { Token } from "../../state/auth";

type AuthStatus = "not logged in" | "expired" | "guest" | "user";

export function computeAuthStatus(token: Token): AuthStatus {
  if (!token) return "not logged in";

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const currentEpochSeconds = Date.now() / 1000;

  if (decoded.exp < currentEpochSeconds) return "expired";

  const auth = new Authentication(token);
  if (auth.isGuest) return "guest";

  return "user";
}
