import * as jwt from "jsonwebtoken";

interface PassedValidationResult<TPayload> {
  readonly success: true;
  readonly payload: TPayload;
}

interface FailedValidationResult {
  readonly success: false;
}

type ValidationResult<TPayload> =
  | PassedValidationResult<TPayload>
  | FailedValidationResult;

type Validator<TPayload> = (input: unknown) => input is TPayload;

export default class JwtVerifier<TPayload> {
  readonly #validator: Validator<TPayload>;
  readonly #secret: string;

  constructor(validator: Validator<TPayload>, secret: string) {
    this.#validator = validator;
    this.#secret = secret;
  }

  /**
   * Checks if a token is valid, and type checks the payload using the validator passed in.
   * @param token The token to validate.
   */
  isValid(token: string): ValidationResult<TPayload> {
    try {
      const payload = jwt.verify(token, this.#secret);

      if (!this.#validator(payload)) {
        throw new TypeError("JWT Payload is of an invalid type.");
      }

      return { success: true, payload };
    } catch {
      return { success: false };
    }
  }
}
