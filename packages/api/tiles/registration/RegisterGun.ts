import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "gun" as const;
let _: keyof typeof registrations = key;

export const zRegisterGun = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterGun = SchemaInput<typeof zRegisterGun>;

export function registerGun(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Action;

  const gun = mgr.register({ textureId: "gun", storing, preferredLayer, isSolid: false });
  storing.connect(gun, 0);

  mgr.pack({
    name: "gun",
    blocks: [gun],
  });
}