import { ZHeap, zSignHeap, ZSignHeap } from "../../types";
import { BlockInfo } from "../TileRegistration";
import { BlockStoring } from "./BlockStoring";

export class SignStoring implements BlockStoring<ZSignHeap> {
  id!: number;

  constructor(readonly sourceId: number) {}

  serialize(id: number, heap: ZSignHeap): [number, ZSignHeap] {
    if (id !== this.id) throw new Error("id doesnt match");
    zSignHeap.parse(heap); // make sure
    return [this.sourceId, heap];
  }

  deserialize([sourceId, argHeap]: [number, unknown]): [number, ZSignHeap] {
    if (this.sourceId !== sourceId)
      throw new Error("`deserialize` should be called with the right `category`");

    const heap = zSignHeap.parse(argHeap);

    return [this.id, heap];
  }
}
