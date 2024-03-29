import * as uuid from "uuid";

export default class UuidGenerator {
  // TODO: use v5 to prevent collisions?
  genIdForDynamicWorld(): string {
    const id = uuid.v4();
    return "D" + id.substr(1);
  }

  getnIdForSavedWorld(): string {
    const id = uuid.v4();
    return "5" + id.substr(1);
  }

  genIdShopItem(): string {
    return "A" + uuid.v4().substr(1);
  }
}
