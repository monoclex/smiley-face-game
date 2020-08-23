import BaseType from "./BaseType";

export default function key(gun: BaseType): string {
  return "base-" + gun;
}
