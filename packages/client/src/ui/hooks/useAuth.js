import { Authentication } from "@smiley-face-game/api";
import { useToken } from "./useToken";

export function useAuth() {
  const [token] = useToken();

  if (!token) {
    throw new Error("`useAuth` should only be called from authenticated routes");
  }

  return new Authentication(token);
}
