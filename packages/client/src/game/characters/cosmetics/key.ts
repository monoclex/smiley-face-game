import CosmeticType from "./CosmeticType";

export default function key(cosmetic: CosmeticType): string {
  return "cosmetic-" + cosmetic;
}
