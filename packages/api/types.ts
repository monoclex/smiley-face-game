import Schema, {
  string,
  number,
  boolean,
  array,
  SchemaInput,
  addParse,
} from "./computed-types-wrapper";
import { zCategory, zCategoryType } from "./enums";

// TODO: validate JWT with zod
export const zToken = addParse(string.min(1));

// https://stackoverflow.com/a/24573236
const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const usernameRegex = /[A-Za-z0-9_]/;
// https://stackoverflow.com/a/201378

const emailRegex =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export const zGuid = addParse(string.regexp(guidRegex));
export const zWorldId = addParse(zGuid);
export const zAccountId = addParse(zGuid);
export const zWorldName = addParse(string.min(1).max(64));
export const zQuantity = addParse(number.integer().min(0));
export const zShopItemId = addParse(number.integer().min(0)); // TODO: cap item ids?
export type ZShopItemId = SchemaInput<typeof zShopItemId>;
export const zUserId = addParse(number.integer().min(0));
export type ZUserId = SchemaInput<typeof zUserId>;
export const zUsername = addParse(string.regexp(usernameRegex).min(3).max(20));
export const zAngle = addParse(number.min(-Math.PI).max(Math.PI));
export type ZAngle = SchemaInput<typeof zAngle>;
export const zMessage = addParse(string.min(1).max(240));
export const zEmail = addParse(string.regexp(emailRegex));
// server uses bcrypt for storing passwords, https://security.stackexchange.com/a/184090
export const zPassword = addParse(string.min(1).max(72));
export const zEnergy = zQuantity;

export const zDynWidth = addParse(number.integer().min(3).max(50));
export const zDynHeight = addParse(number.integer().min(3).max(50));

export const zSize = addParse(
  Schema({
    width: number.integer().min(3),
    height: number.integer().min(3),
  })
);
export type ZSize = SchemaInput<typeof zSize>;

export const zRole = addParse(
  Schema.either("non" as const, "edit" as const, "owner" as const, "staff" as const)
);
export type ZRole = SchemaInput<typeof zRole>;

// TODO: way to constrain maximum number?
export const zPlayerPosition = addParse(
  Schema({
    x: number,
    y: number,
  })
);
export type ZPlayerPosition = SchemaInput<typeof zPlayerPosition>;

export const zInputs = addParse(
  Schema({
    left: boolean,
    right: boolean,
    up: boolean,
    down: boolean,
    jump: boolean,
  })
);
export type ZInputs = SchemaInput<typeof zInputs>;

export const zVelocity = addParse(
  Schema({
    x: number,
    y: number,
  })
);
export type ZVelocity = SchemaInput<typeof zVelocity>;

export const zBlockPosition = (width: number, height: number) =>
  addParse(
    Schema({
      x: number.integer().min(0).max(width),
      y: number.integer().min(0).max(height),
    })
  );
export type ZBlockPosition = SchemaInput<ReturnType<typeof zBlockPosition>>;

export const zBoundlessBlockPosition = addParse(
  Schema({
    x: number.integer().min(0),
    y: number.integer().min(0),
  })
);

export enum TileLayer {
  // TODO: order this to make logical sense?
  Foreground = 0,
  Action = 1,
  Background = 2,
  Decoration = 3,
}
export const zTileLayer = addParse(Schema.enum(TileLayer));
export type ZTileLayer = SchemaInput<typeof zTileLayer>;

export enum Rotation {
  Right = 0,
  Up = 1,
  Left = 2,
  Down = 3,
}

// because blocks are only numeric ids, we can just use numbers
// in the future, when we have portals, it'll be important to have something like { id: x, target: x, } etc
export const zBlock = addParse(
  Schema.either(
    number,
    Schema({
      id: number,
      signText: string.max(200),
    })
  )
);
export type ZBlock = SchemaInput<typeof zBlock>;

export const zPlayerListActionKind = addParse(
  Schema.either(
    {
      action: "give edit" as const,
      playerId: zUserId,
    },
    {
      action: "remove edit" as const,
      playerId: zUserId,
    },
    {
      action: "kick" as const,
      playerId: zUserId,
    }
  )
);

export const zWorldActionKind = addParse(
  Schema.either(
    {
      action: "save" as const,
    },
    {
      action: "load" as const,
    },
    {
      action: "clear" as const,
    }
  )
);

export const zWorldBlocks = addParse(array.of(array.of(array.of(zBlock))));
export type ZWorldBlocks = SchemaInput<typeof zWorldBlocks>;

export const zWorldActionKindReply = Schema.either(
  {
    action: "save" as const,
  },
  {
    action: "load" as const,
    blocks: zWorldBlocks,
  },
  {
    action: "clear" as const,
  }
);
export type ZWorldActionKindReply = SchemaInput<typeof zWorldActionKindReply>;

// TODO: this looks like it needs to be re-done. direct port of WorldDetails schema
export const zWorldDetails = addParse(
  Schema({
    name: zWorldName,
    owner: zUsername.optional(),
    ownerId: zAccountId.optional(),
    width: number.min(3).max(100).integer(),
    height: number.min(3).max(100).integer(),
  })
);
export type ZWorldDetails = SchemaInput<typeof zWorldDetails>;

export type { ZTileRegistrationKind as ZTileBehavior } from "./tiles/registration/RegisterJson";
import { zTileRegistration as zTileJson } from "./tiles/registration/RegisterJson";
export { zTileJson };
export type { ZTileRegistration as ZTileJson } from "./tiles/registration/RegisterJson";

export const zTileJsonFile = addParse(array.of(zTileJson));
export type ZTileJsonFile = SchemaInput<typeof zTileJsonFile>;

const DateStringType = (arg: unknown): Date => {
  if (typeof arg === "string") {
    const parsedDate = Date.parse(arg);
    if (Number.isNaN(parsedDate)) throw new TypeError("Expected valid date");

    return new Date(parsedDate);
  } else if (arg instanceof Date) {
    return arg;
  } else {
    throw new TypeError("Got neither Date nor string");
  }
};

export const zShopItem = addParse(
  Schema({
    id: zShopItemId,
    title: string.min(1).max(32),
    description: string.min(1).max(256),
    // used for sorting purposes
    dateIntroduced: DateStringType,
    category: zCategory,
    categoryType: zCategoryType,
    // 0 if no limit
    limit: zQuantity,
    owned: zQuantity,
    energySpent: zEnergy,
    energyCost: zEnergy.min(1),
    columnSpan: zQuantity.optional(),
  })
);
export type ZShopItem = SchemaInput<typeof zShopItem>;
