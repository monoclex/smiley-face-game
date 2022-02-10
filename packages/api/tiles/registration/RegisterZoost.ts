import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "zoost" as const;
let _: keyof typeof registrations = key;

export const zRegisterZoost = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterZoost = SchemaInput<typeof zRegisterZoost>;

export function registerZoost(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Action;

  const blocks = mgr.registerMany(
    ["zoost-up", "zoost-right", "zoost-down", "zoost-left"],
    (textureId) => ({ textureId, storing, preferredLayer })
  );

  storing.connectMany(blocks);

  mgr.pack({
    name: "zoost",
    blocks,
  });
}
