import S, { SchemaInput } from "computed-types";

export default S;

interface ParseSchema<T> {
  parse(input: unknown): SchemaInput<T>;
}

export type ParsableSchemaInput<T> = T & ParseSchema<T>;

export function addParse<T>(input: T): ParsableSchemaInput<T> {
  //@ts-ignore
  const validator = input.destruct();
  //@ts-ignore
  input.parse = (thing) => {
    const [errors, body] = validator(thing);
    if (errors !== null) throw new Error(errors.toString());
    return body;
  };
  //@ts-ignore
  input.safeParse = (thing) => {
    const [errors, body] = validator(thing);
    if (errors !== null) return { success: false, errors: errors };
    return { success: true, value: body };
  };
  //@ts-ignore
  return input;
}

export { array, boolean, number, string } from "computed-types";
export type { SchemaInput } from "computed-types";
