import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { HeapKind } from "../TileRegistration";
import { GenericRegistration, registrations } from "./Registrations";

const key = "sign" as const;
let _: keyof typeof registrations = key;

export const zRegisterSign = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterSign = SchemaInput<typeof zRegisterSign>;

export function registerSign(mgr: GenericRegistration) {
  const storing = new SourceAndIdStorage(mgr.sourceId);
  const preferredLayer = TileLayer.Decoration;

  const sign = mgr.register({
    textureId: "sign",
    storing,
    preferredLayer,
    isSolid: false,
    heap: HeapKind.Sign,
  });
  storing.connect(sign, 0);

  mgr.pack({
    name: "sign",
    blocks: [sign],
  });
}
