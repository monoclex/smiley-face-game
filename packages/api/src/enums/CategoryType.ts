import Schema, { addParse } from "../computed-types-wrapper";

export enum CategoryType {
  None = 0,
  Featured = 1 << 1,
  Owned = 1 << 2,
}

export const zCategoryType = addParse(Schema.enum(CategoryType));
