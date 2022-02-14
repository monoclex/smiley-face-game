import { ZTileJsonFile } from "../types";

// prettier-ignore
const tiles: ZTileJsonFile = [
  {
    behavior: "solid",
    name: "basic",
    tiles: ["white", "brown", "black", "red", "orange", "yellow", "green", "aqua", "blue", "purple"],
  },
  {
    behavior: "gun",
  },
  {
    behavior: "arrow",
  },
  {
    behavior: "solid",
    name: "prismarine",
    tiles: ["basic", "anchor", "brick", "slab", "crystal"],
  },
  {
    behavior: "solid",
    name: "gemstone",
    tiles: ["red", "orange", "yellow", "green", "aqua", "blue", "purple", "pink"],
  },
  {
    behavior: "solid",
    name: "tshell",
    tiles: ["white", "gray", "black", "red", "orange", "yellow", "green", "aqua", "light-blue", "blue", "purple", "pink"],
  },
  {
    behavior: "solid",
    name: "pyramid",
    tiles: ["white", "gray", "black", "red", "orange", "yellow", "green", "cyan", "blue", "purple"],
  },
  {
    behavior: "solid",
    name: "choc",
    tiles: ["l0", "l0mint", "l1", "l2", "l3", "l4", "l5"],
  },
  {
    behavior: "boost",
  },
  {
    behavior: "keys",
    name: "keys",
    tiles: ["red"],
  },
  {
    behavior: "zoost",
  },
  {
    behavior: "sign",
  }
];

export default tiles;
