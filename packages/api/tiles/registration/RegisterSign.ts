import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SignStoring } from "../storage/SignStoring";
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
  const storing = new SignStoring(mgr.sourceId);
  const preferredLayer = TileLayer.Decoration;

  const sign = mgr.register({
    textureId: "sign",
    storing,
    preferredLayer,
    isSolid: false,
    heap: HeapKind.Sign,
  });

  storing.id = sign.id;

  mgr.pack({
    name: "sign",
    blocks: [sign],
  });
}
