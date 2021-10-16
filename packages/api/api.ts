import Schema, { SchemaInput, array, boolean, number, string, addParse } from "./computed-types-wrapper";
import { zUsername, zWorldId, zWorldName, zAccountId, zToken, zPassword, zEmail, zShopItem } from "./types";

export const zGamePreview = addParse(
  Schema({
    id: zWorldId,
    name: zWorldName,
    playerCount: number.integer().min(0),
  })
);
export type ZGamePreview = SchemaInput<typeof zGamePreview>;

export const zLobbyResp = addParse(array.of(zGamePreview));
export type ZLobbyResp = SchemaInput<typeof zLobbyResp>;

export const zLoginReq = addParse(
  Schema({
    email: string.min(1),
    password: string.min(1),
  })
);

export const zTokenResp = addParse(
  Schema({
    token: zToken,
  })
);
export type ZTokenResp = SchemaInput<typeof zTokenResp>;

export const zRegisterReq = addParse(
  Schema({
    username: zUsername,
    email: zEmail,
    password: zPassword,
  })
);

export const zRegisterResp = addParse(
  Schema({
    token: zToken,
    id: zAccountId,
  })
);
export type ZRegisterResp = SchemaInput<typeof zRegisterResp>;

export const zGuestReq = addParse(
  Schema({
    username: zUsername,
  })
);

export const zPlayerResp = addParse(
  Schema({
    isGuest: boolean,
    name: zUsername,
    energy: number.optional(),
    maxEnergy: number.optional(),
    energyRegenerationRateMs: number.optional(),
    lastEnergyAmount: number.optional(),
    timeEnergyWasAtAmount: string.optional(),
    ownedWorlds: array
      .of({
        type: "saved" as const,
        id: zWorldId,
        name: zWorldName,
        playerCount: number.integer().min(0),
      })
      .optional(),
  })
);
export type ZPlayerResp = SchemaInput<typeof zPlayerResp>;

export const zShopItemsResp = addParse(array.of(zShopItem));
export type ZShopItemsResp = SchemaInput<typeof zShopItemsResp>;
