import Schema, { SchemaInput } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { EmptyStoring } from "../storage/EmptyStoring";
import { GenericRegistration, registrations } from "./Registrations";

const key = "empty" as const;
let _: keyof typeof registrations = key;

export const zRegisterEmpty = addParse(
  Schema({
    behavior: key,
  })
);
export type ZRegisterEmpty = SchemaInput<typeof zRegisterEmpty>;

export function registerEmpty(mgr: GenericRegistration) {
  const preferredLayer = TileLayer.Foreground; // buest guesst

  const empty = mgr.register(
    {
      textureId: "empty",
      storing: new EmptyStoring(),
      preferredLayer,
      isSolid: false,
    },
    "special-empty-block"
  );

  mgr.pack({
    name: "empty",
    blocks: [empty],
  });
}
