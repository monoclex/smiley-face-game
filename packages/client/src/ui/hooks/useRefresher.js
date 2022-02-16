import { useRecoilRefresher_UNSTABLE } from "recoil";
import { lobbySelector, playerInfoSelector, playerInfoCacheAtom } from "../../state";

/** Refreshes lobby and player state */
export function useRefresher() {
  const resetLobby = useRecoilRefresher_UNSTABLE(lobbySelector);
  const resetPlayer = useRecoilRefresher_UNSTABLE(playerInfoSelector);
  const resetPlayerCache = useRecoilRefresher_UNSTABLE(playerInfoCacheAtom);

  return () => {
    resetPlayerCache();
    resetPlayer();
    resetLobby();
  };
}
