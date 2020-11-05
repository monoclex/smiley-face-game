import * as z from "zod";
import { zUsername, zWorldId, zWorldName, zAccountId, zToken } from "./misc-zs";

// TODO: fill this in
export const zLobbyResp = z.array(z.object({
  type: z.enum(["saved", "dynamic"]),
  id: zWorldId,
  name: zWorldName,
  playerCount: z.number().int().min(0),
}));

export const zLoginReq = z.object({
  email: z.string().nonempty(),
  password: z.string().nonempty(),
});

export const zLoginResp = z.object({
  token: zToken,
  id: zAccountId,
});

export const zGuestReq = z.object({
  username: zUsername
});

export const zGuestResp = z.object({
  token: zToken,
});

// TODO: fill this in
export const zPlayerResp = z.object({
  isGuest: z.boolean(),
  name: zUsername,
  energy: z.number().optional(),
  maxEnergy: z.number().optional(),
  energyRegenerationRateMs: z.number().optional(),
  lastEnergyAmount: z.number().optional(),
  timeEnergyWasAtAmount: z.string().optional(),
  ownedWorlds: z.array(z.object({
    type: z.literal("saved"),
    id: zWorldId,
    name: zWorldName,
    playerCount: z.number().int().min(0)
  })).optional()
});

