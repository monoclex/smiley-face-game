/**
 * @description This file is to fulfill the dependency requirements of `core` on a deno/typescript basis. This fulfills the dependencies
 * using typescript's NPM module resolution.
 */

import Schema, { Type, unknown, object, array, string, number, boolean } from "computed-types";
export { Schema, Type, unknown, object, array, string, number, boolean };

type ExportingWebSocket = WebSocket;
export { ExportingWebSocket as WebSocket };
