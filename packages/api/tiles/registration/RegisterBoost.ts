import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { GenericRegistration, registrations } from "./Registrations";

const key = "boost" as const;
let _: keyof typeof registrations = key;

export const zRegisterBoost = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterBoost = SchemaInput<typeof zRegisterBoost>;

export function registerBoost(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);

  const blocks = mgr.registerMany(
    ["boost-up", "boost-right", "boost-down", "boost-left"],
    (textureId) => ({ textureId, storing })
  );

  storing.connectMany(blocks);

  mgr.pack({
    name: "boost",
    blocks,
  });
}
