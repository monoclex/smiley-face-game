/**
 * Validates some given data. This is performed as a "just in case" mechanism, to hopefully catch any gremlin bugs.
 * @param validator The validator to run on the data.
 * @param data The data to validate.
 */
export default function ensureValidates<TData>(
  // really, a ValidatorProxy in "computed-types", but we've simplified the signature here.
  validator: (data: TData) => [TypeError | null, unknown?],
  data: TData
) {
  const [errors] = validator(data);

  if (errors !== null) {
    throw new Error(`Failed to validate "${data}" as valid data.`);
  }
}
