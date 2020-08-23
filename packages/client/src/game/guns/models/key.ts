import GunType from "./GunType";

export default function key(gun: GunType): string {
  return "gun-" + gun;
}
