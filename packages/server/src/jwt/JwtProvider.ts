export default class JwtProvider<TPayload> {
  readonly #secret: string;

  constructor(secret: string) {
    this.#secret = secret;
  }

  // authenticate()
}