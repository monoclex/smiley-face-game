import { useRecoilState } from "recoil";
import { shopItemQuery } from "../../state";

export function useShopItem(id) {
  return useRecoilState(shopItemQuery(id));
}
