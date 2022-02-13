import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "dot" as const;
let _: keyof typeof registrations = key;

export const zRegisterDot = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterDot = SchemaInput<typeof zRegisterDot>;

export function registerDot(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Action;

  // TODO add slow-dot & fast-dot(?)
  const blocks = mgr.registerMany(["dot"], (textureId) => ({
    textureId,
    storing,
    preferredLayer,
    isSolid: false,
  }));

  storing.connectMany(blocks);

  mgr.pack({
    name: "dot",
    blocks,
  });
}
