import { useRecoilValue } from "recoil";
import { shopItemsState } from "../../state";

export function useShopItems() {
  return useRecoilValue(shopItemsState);
}
