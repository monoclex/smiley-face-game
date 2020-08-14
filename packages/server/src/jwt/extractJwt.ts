import JwtPayload from "./JwtPayload";
import JwtVerifier from "./JwtVerifier";

export default function extractJwt(verifier: JwtVerifier, token: string | undefined): JwtPayload {
  if (token === undefined) {
    throw new TypeError("No JWT token was specified in the Authorization header.");
  }

  const validationResult = verifier.isValid(token);

  if (!validationResult.success) {
    throw new Error("The JWT token is invalid.")
  }

  return validationResult.payload;
}
