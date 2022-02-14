import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "arrow" as const;
let _: keyof typeof registrations = key;

export const zRegisterArrow = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterArrow = SchemaInput<typeof zRegisterArrow>;

export function registerArrow(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Action;

  // TODO add slow-dot & fast-dot(?)
  const blocks = mgr.registerMany(
    ["arrow-up", "arrow-right", "arrow-down", "arrow-left", "dot"],
    (textureId) => ({ textureId, storing, preferredLayer, isSolid: false })
  );

  storing.connectMany(blocks);

  mgr.pack({
    name: "arrow",
    blocks,
  });
}
