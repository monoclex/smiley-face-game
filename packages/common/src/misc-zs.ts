import * as z from "zod";

// TODO: validate JWT with zod
export const zToken = z.string().nonempty();

// https://stackoverflow.com/a/24573236
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const usernameRegex = /[A-Za-z0-9_]/;
// https://stackoverflow.com/a/201378
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const zGuid = z.string().regex(guidRegex);
export const zWorldId = zGuid;
export const zAccountId = zGuid;
export const zWorldName = z.string().min(1).max(64);
export const zUserId = z.number().int().min(0);
export const zUsername = z.string().regex(usernameRegex).min(3).max(20);
export const zAngle = z.number().min(-Math.PI).max(Math.PI);
export const zMessage = z.string().min(1).max(240);
export const zEmail = z.string().regex(emailRegex);
// server uses bcrypt for storing passwords, https://security.stackexchange.com/a/184090
export const zPassword = z.string().min(1).max(72);

const zDynSize = z.number().int().min(3).max(50);
export const zDynWidth = zDynSize;
export const zDynHeight = zDynSize;

export const zSize = z.object({
  width: z.number().int().min(3),
  height: z.number().int().min(3),
})

export const zRole = z.enum(["non", "edit", "owner", "staff"]);

// TODO: way to constrain maximum number?
export const zPlayerPosition = z.object({
  x: z.number(),
  y: z.number(),
});

export const zInputs = z.object({
  left: z.boolean(),
  right: z.boolean(),
  up: z.boolean(),
  jump: z.boolean(),
});

export const zVelocity = z.object({
  x: z.number(),
  y: z.number(),
});

export const zBlockPosition = (width: number, height: number) => z.object({
  x: z.number().int().min(0).max(width),
  y: z.number().int().min(0).max(height),
});

export const zBoundlessBlockPosition = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
});

export enum TileId {
  Empty = 0,
  Basic = 1,
  Gun = 2,
  Arrow = 3,
  Prismarine = 4,
}
export const zTileId = z.nativeEnum(TileId);

export enum TileLayer {
  // TODO: order this to make logical sense?
  Foreground = 0,
  Action = 1,
  Background = 2,
  Decoration = 3,
}
export const zTileLayer = z.nativeEnum(TileLayer);

// TODO: move this into a helpers file?
export function swapLayer(layer: TileLayer): TileLayer {
  if (layer === TileLayer.Action) return layer;
  return layer === TileLayer.Foreground ? TileLayer.Background : TileLayer.Foreground;
}

export const zColor = z.enum([
  "white", "black", "brown", "red", "orange", "yellow", "green", "blue", "purple"
]);

export enum Rotation {
  Right = 0,
  Up = 1,
  Left = 2,
  Down = 3,
}
export const zRotation = z.nativeEnum(Rotation);

export enum PrismarineVariant {
  Basic = 0,
  Anchor = 1,
  Brick = 2,
  Slab = 3,
  Crystal = 4,
}
export const zPrismarineVariant = z.nativeEnum(PrismarineVariant);

export const zBlock = z.union([z.object({
  id: z.literal(TileId.Empty),
}), z.object({
  id: z.literal(TileId.Basic),
  color: zColor.optional(),
}), z.object({
  id: z.literal(TileId.Gun),
}), z.object({
  id: z.literal(TileId.Arrow),
  rotation: zRotation,
}), z.object({
  id: z.literal(TileId.Prismarine),
  variant: zPrismarineVariant,
})]);

// TODO: move this into a helpers file?
// ^^^^^ it'd actually be better to have this be a part of the configuration on a per-block basis or something
export function inferLayer(block: z.infer<typeof zBlock>): TileLayer {
  switch (block.id) {
    // just make a best guess
    case TileId.Empty: return TileLayer.Foreground;
    case TileId.Basic: return TileLayer.Foreground;
    case TileId.Gun: return TileLayer.Action;
    case TileId.Arrow: return TileLayer.Action;
    case TileId.Prismarine: return TileLayer.Foreground;
  }
}

export const zPlayerListActionKind = z.union([z.object({
  action: z.literal("give edit"),
  playerId: zUserId,
}), z.object({
  action: z.literal("remove edit"),
  playerId: zUserId,
}), z.object({
  action: z.literal("kick"),
  playerId: zUserId,
})]);

export const zWorldActionKind = z.union([z.object({
  action: z.literal("save"),
}), z.object({
  action: z.literal("load"),
  // TODO: enforce that the **server** will send this, and that the client **wont**.
  // for now, saying that this is optional and calling it a day is me being lazy
  // blocks: WorldBlocksSchema.optional(),
})]);

export const zWorldBlocks = z.array(z.array(z.array(zBlock)));

export const zWorldActionKindReply = z.union([z.object({
  action: z.literal("save"),
}), z.object({
  action: z.literal("load"),
  blocks: zWorldBlocks,
})]);
