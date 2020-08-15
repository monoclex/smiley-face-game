import Schema, { Type } from "computed-types";
import { UsernameSchema } from "@smiley-face-game/api/schemas/Username";
import { PasswordSchema } from "@smiley-face-game/api/schemas/Password";
import { EmailSchema } from "@smiley-face-game/api/schemas/Email";

export const RegisterSchema = Schema({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});
export type Register = Type<typeof RegisterSchema>;
export const validateRegister = RegisterSchema.destruct();
