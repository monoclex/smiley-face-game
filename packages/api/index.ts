/**
 * @description This file exports all relevant public APIs for smiley face game. Each export has a reason for being exported.
 */

/**
 * Export the primary exports of notable sub-modules
 */
export * from "./net";
export * from "./game";

/**
 * The types of packets are needed for type checking. In addition, the validators for a client and serverside packet
 * are needed by the server.w
 */
import type { ZPacket, ZSPacket, ZPacketValidator, ZPacketLookup } from "./packets";
export type { ZPacket, ZSPacket, ZPacketValidator, ZPacketLookup };
import { zPacket, zsPacket } from "./packets";
export { zPacket, zsPacket };

/**
 * There are a handful of things that we don't actually want exported, but want available for typing reasons.
 * Here, we export them as `types` so it's impossible for regular javascript to access it (importing by type helps for
 * tree shaking too), but it's still possible for typescript to remain well types. These will be added on a case by
 * case basis.
 */
import type { SchemaInput } from "./computed-types-wrapper";
import type { zJoinRequest } from "./ws-api";
export type ZJoinRequest = SchemaInput<typeof zJoinRequest>;
import type { zRole } from "./types";
export type ZRole = SchemaInput<typeof zRole>;
