import * as jwt from "jsonwebtoken";
import { isA } from "ts-type-checked";
import JwtPayload from "./JwtPayload";

interface PassedValidationResult {
  readonly success: true;
  readonly payload: JwtPayload;
}

interface FailedValidationResult {
  readonly success: false;
}

type ValidationResult = PassedValidationResult | FailedValidationResult;

export default class JwtVerifier {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  /**
   * Checks if a token is valid, and type checks the payload using ts-type-checked.
   * @param token The token to validate.
   */
  isValid(token: string): ValidationResult {
    try {
      const payload = jwt.verify(token, this.#secret);

      if (!isA<JwtPayload>(payload)) {
        throw new TypeError("JWT Payload is of an invalid type.");
      }

      return { success: true, payload };
    }
    catch {
      return { success: false };
    }
  }
}