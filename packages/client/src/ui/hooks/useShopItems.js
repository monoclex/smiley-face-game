import { useRecoilValue } from "recoil";
import { shopItemsSelector } from "../../state";

export function useShopItems() {
  return useRecoilValue(shopItemsSelector);
}
