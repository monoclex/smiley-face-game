import Schema, { string, number, boolean, array, SchemaInput, addParse } from "./computed-types-wrapper";

// TODO: validate JWT with zod
export const zToken = addParse(string.min(1));

// https://stackoverflow.com/a/24573236
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const usernameRegex = /[A-Za-z0-9_]/;
// https://stackoverflow.com/a/201378
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const zGuid = addParse(string.regexp(guidRegex));
export const zWorldId = addParse(zGuid);
export const zAccountId = addParse(zGuid);
export const zWorldName = addParse(string.min(1).max(64));
export const zUserId = addParse(number.integer().min(0));
export type ZUserId = SchemaInput<typeof zUserId>;
export const zUsername = addParse(string.regexp(usernameRegex).min(3).max(20));
export const zAngle = addParse(number.min(-Math.PI).max(Math.PI));
export type ZAngle = SchemaInput<typeof zAngle>;
export const zMessage = addParse(string.min(1).max(240));
export const zEmail = addParse(string.regexp(emailRegex));
// server uses bcrypt for storing passwords, https://security.stackexchange.com/a/184090
export const zPassword = addParse(string.min(1).max(72));

export const zDynWidth = addParse(number.integer().min(3).max(50));
export const zDynHeight = addParse(number.integer().min(3).max(50));

export const zSize = addParse(Schema({
  width: number.integer().min(3),
  height: number.integer().min(3),
}));
export type ZSize = SchemaInput<typeof zSize>;

export const zRole = addParse(Schema.either("non" as const, "edit" as const, "owner" as const, "staff" as const));
export type ZRole = SchemaInput<typeof zRole>;

// TODO: way to constrain maximum number?
export const zPlayerPosition = addParse(Schema({
  x: number,
  y: number,
}));
export type ZPlayerPosition = SchemaInput<typeof zPlayerPosition>;

export const zInputs = addParse(Schema({
  left: boolean,
  right: boolean,
  up: boolean,
  jump: boolean,
}));
export type ZInputs = SchemaInput<typeof zInputs>;

export const zVelocity = addParse(Schema({
  x: number,
  y: number,
}));
export type ZVelocity = SchemaInput<typeof zVelocity>;

export const zBlockPosition = (width: number, height: number) => addParse(Schema({
  x: number.integer().min(0).max(width),
  y: number.integer().min(0).max(height),
}));
export type ZBlockPosition = SchemaInput<ReturnType<typeof zBlockPosition>>;

export const zBoundlessBlockPosition = addParse(Schema({
  x: number.integer().min(0),
  y: number.integer().min(0),
}));

export enum TileId {
  Empty = 0,
  Basic = 1,
  Gun = 2,
  Arrow = 3,
  Prismarine = 4,
}
export const zTileId = addParse(Schema.enum(TileId));
export type ZTileId = SchemaInput<typeof zTileId>;

export enum TileLayer {
  // TODO: order this to make logical sense?
  Foreground = 0,
  Action = 1,
  Background = 2,
  Decoration = 3,
}
export const zTileLayer = addParse(Schema.enum(TileLayer));
export type ZTileLayer = SchemaInput<typeof zTileLayer>;

// TODO: move this into a helpers file?
export function swapLayer(layer: TileLayer): TileLayer {
  if (layer === TileLayer.Action) return layer;
  return layer === TileLayer.Foreground ? TileLayer.Background : TileLayer.Foreground;
}

export const zColor = addParse(Schema.either(
  Schema.either("white" as const, "black" as const, "brown" as const, "red" as const, "orange" as const, "yellow" as const,
    "green" as const, "blue" as const),
  "purple" as const
));
export type ZColor = SchemaInput<typeof zColor>;

export enum Rotation {
  Right = 0,
  Up = 1,
  Left = 2,
  Down = 3,
}
export const zRotation = addParse(Schema.enum(Rotation));

export enum PrismarineVariant {
  Basic = 0,
  Anchor = 1,
  Brick = 2,
  Slab = 3,
  Crystal = 4,
}
export const zPrismarineVariant = addParse(Schema.enum(PrismarineVariant));

export const zBlock = addParse(Schema.either({
  id: TileId.Empty as const,
}, {
  id: TileId.Basic as const,
  color: zColor.optional(),
}, {
  id: TileId.Gun as const,
}, {
  id: TileId.Arrow as const,
  rotation: zRotation,
}, {
  id: TileId.Prismarine as const,
  variant: zPrismarineVariant,
}));
export type ZBlock = SchemaInput<typeof zBlock>;

// TODO: move this into a helpers file?
// ^^^^^ it'd actually be better to have this be a part of the configuration on a per-block basis or something
export function inferLayer(block: SchemaInput<typeof zBlock>): TileLayer {
  switch (block.id) {
    // just make a best guess
    case TileId.Empty: return TileLayer.Foreground;
    case TileId.Basic: return TileLayer.Foreground;
    case TileId.Gun: return TileLayer.Action;
    case TileId.Arrow: return TileLayer.Action;
    case TileId.Prismarine: return TileLayer.Foreground;
  }
}

export const zPlayerListActionKind = addParse(Schema.either({
  action: "give edit" as const,
  playerId: zUserId,
}, {
  action: "remove edit" as const,
  playerId: zUserId,
}, {
  action: "kick" as const,
  playerId: zUserId,
}));

export const zWorldActionKind = addParse(Schema.either({
  action: "save" as const,
}, {
  action: "load" as const,
  // TODO: enforce that the **server** will send this, and that the client **wont**.
  // for now, saying that this is optional and calling it a day is me being lazy
  // blocks: WorldBlocksSchema.optional(),
}));

export const zWorldBlocks = addParse(array.of(array.of(array.of(zBlock))));
export type ZWorldBlocks = SchemaInput<typeof zWorldBlocks>;

export const zWorldActionKindReply = Schema.either({
  action: "save" as const,
}, {
  action: "load" as const,
  blocks: zWorldBlocks,
});

// TODO: this looks like it needs to be re-done. direct port of WorldDetails schema
export const zWorldDetails = addParse(Schema({
  name: zWorldName,
  owner: zUsername.optional(),
  ownerId: zAccountId.optional(),
  width: number.min(3).max(100).integer(),
  height: number.min(3).max(100).integer(),
}));
export type ZWorldDetails = SchemaInput<typeof zWorldDetails>;
