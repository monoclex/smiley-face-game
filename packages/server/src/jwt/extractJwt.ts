import JwtVerifier from "./JwtVerifier";

export default function extractJwt<TPayload>(
  verifier: JwtVerifier<TPayload>,
  token: string | undefined
): TPayload {
  if (token === undefined) {
    throw new TypeError(
      "No JWT token was specified in the Authorization header."
    );
  }

  const validationResult = verifier.isValid(token);

  if (!validationResult.success) {
    throw new Error("The JWT token is invalid.");
  }

  return validationResult.payload;
}
