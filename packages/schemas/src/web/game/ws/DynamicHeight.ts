import {
  DynamicWidthSchema,
  validateDynamicWidth,
} from "./DynamicWidth";

import type { DynamicWidth } from "./DynamicWidth";

// The height allowed by a dynamic world.

export {
  DynamicWidthSchema as DynamicHeightSchema,
  validateDynamicWidth as validateDynamicHeight,
};

export type {
  DynamicWidth as DynamicHeight,
};
