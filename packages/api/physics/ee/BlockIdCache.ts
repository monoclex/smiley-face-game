import TileRegistration from "../../tiles/TileRegistration";

export class BlockIdCache {
  readonly arrowUp: number;
  readonly arrowRight: number;
  readonly arrowDown: number;
  readonly arrowLeft: number;
  readonly boostUp: number;
  readonly boostRight: number;
  readonly boostDown: number;
  readonly boostLeft: number;
  readonly zoostUp: number;
  readonly zoostRight: number;
  readonly zoostDown: number;
  readonly zoostLeft: number;
  readonly keysRedKey: number;
  readonly keysRedGate: number;
  readonly keysRedDoor: number;
  readonly gun: number;
  readonly sign: number;

  constructor(readonly tiles: TileRegistration) {
    this.arrowUp = tiles.id("arrow-up");
    this.arrowRight = tiles.id("arrow-right");
    this.arrowDown = tiles.id("arrow-down");
    this.arrowLeft = tiles.id("arrow-left");
    this.boostUp = tiles.id("boost-up");
    this.boostRight = tiles.id("boost-right");
    this.boostDown = tiles.id("boost-down");
    this.boostLeft = tiles.id("boost-left");
    this.zoostUp = tiles.id("zoost-up");
    this.zoostRight = tiles.id("zoost-right");
    this.zoostDown = tiles.id("zoost-down");
    this.zoostLeft = tiles.id("zoost-left");
    this.keysRedKey = tiles.id("keys-red-key");
    this.keysRedGate = tiles.id("keys-red-gate");
    this.keysRedDoor = tiles.id("keys-red-door");
    this.gun = tiles.id("gun");
    this.sign = tiles.id("sign");
  }
}
