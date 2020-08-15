import * as uuid from "uuid";

export default class UuidGenerator {
  // TODO: use v5 to prevent collisions?
  genIdForDynamicWorld(): string {
    return uuid.v4();
  }
}
