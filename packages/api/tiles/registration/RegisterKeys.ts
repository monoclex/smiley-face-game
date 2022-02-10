import Schema, { array, SchemaInput, string } from "computed-types";
import { addParse } from "../../computed-types-wrapper";
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
      })
    );

    blocks.push(
      mgr.register({
        textureId: `${data.name}-${tile}-door`,
        storing,
      })
    );

    blocks.push(
      mgr.register({
        textureId: `${data.name}-${tile}-gate`,
        storing,
      })
    );
  }

  storing.connectMany(blocks);

  mgr.pack({
    name: `${data.name}`,
    blocks,
  });
}
