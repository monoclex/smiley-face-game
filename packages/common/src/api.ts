import * as z from "zod";

// TODO: fill this in
export const zLobbyResp = z.array(z.object({}));

export const zLoginReq = z.object({
  email: z.string().nonempty(),
  password: z.string().nonempty(),
});

export const zLoginResp = z.object({
  token: z.string().nonempty(),
});

// TODO: fill this in
export const zPlayerResp = z.array(z.object({}));
