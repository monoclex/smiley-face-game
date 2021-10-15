import Schema, { addParse } from "../computed-types-wrapper";

export enum Category {
  None = 0,
  World = 1,
  Character = 2,
}

export const zCategory = addParse(Schema.enum(Category));
