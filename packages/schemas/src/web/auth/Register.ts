import Schema, { Type } from "computed-types";
import { UsernameSchema } from "@smiley-face-game/schemas/Username";
import { PasswordSchema } from "@smiley-face-game/schemas/Password";
import { EmailSchema } from "@smiley-face-game/schemas/Email";

export const RegisterSchema = Schema({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});
export type Register = Type<typeof RegisterSchema>;
export const validateRegister = RegisterSchema.destruct();
