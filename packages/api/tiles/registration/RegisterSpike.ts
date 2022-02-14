import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "spike" as const;
let _: keyof typeof registrations = key;

export const zRegisterSpike = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterSpike = SchemaInput<typeof zRegisterSpike>;

export function registerSpike(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Action;

  const blocks = mgr.registerMany(
    ["spike-up", "spike-right", "spike-down", "spike-left", "checkpoint"],
    (textureId) => ({ textureId, storing, preferredLayer, isSolid: false })
  );

  storing.connectMany(blocks);

  mgr.pack({
    name: "spike",
    blocks,
  });
}
