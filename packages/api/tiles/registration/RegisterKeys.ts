import Schema, { array, SchemaInput, string } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
import { TileLayer } from "../../types";
import { SourceAndIdStorage } from "../storage/SourceAndIdStorage";
import { BlockInfo } from "../TileRegistration";
import { GenericRegistration, registrations } from "./Registrations";

const key = "keys" as const;
let _: keyof typeof registrations = key;

export const zRegisterKeys = addParse(
  Schema({
    behavior: key,
    name: string,
    tiles: array.of(string),
  })
);
export type ZRegisterKeys = SchemaInput<typeof zRegisterKeys>;

export function registerKeys(mgr: GenericRegistration, data: ZRegisterKeys) {
  const storing = new SourceAndIdStorage(mgr.sourceId);

  const blocks: BlockInfo[] = [];

  for (const tile of data.tiles) {
    blocks.push(
      mgr.register({
        textureId: `${data.name}-${tile}-key`,
        storing,
        preferredLayer: TileLayer.Action,
        isSolid: false,
      })
    );

    blocks.push(
      mgr.register({
        textureId: `${data.name}-${tile}-door`,
        storing,
        preferredLayer: TileLayer.Foreground,
        isSolid: undefined,
      })
    );

    blocks.push(
      mgr.register({
        textureId: `${data.name}-${tile}-gate`,
        storing,
        preferredLayer: TileLayer.Foreground,
        isSolid: undefined,
      })
    );
  }

  storing.connectMany(blocks);

  mgr.pack({
    name: `${data.name}`,
    blocks,
  });
}
