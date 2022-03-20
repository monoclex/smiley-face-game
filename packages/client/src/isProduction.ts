/**
 * NOTICE: even though these variables are available to be exported,
 *
 *                !!! THEY SHOULD NOT BE USED !!!
 *
 * Across module boundaries, webpack/terser have a harder time constant folding
 * meaning expecting these variables to be used for dead code elimination is
 * not possible.
 *
 * Use `import.meta.env.SERVER_MODE` directly in files that require it.
 */

export const serverMode = import.meta.env.SERVER_MODE;

export const isLocalhost = serverMode === "localhost";
export const isDevelopment = serverMode === "development";
export const isProduction = serverMode === "production";

export const isDebugMode = isLocalhost;
export const enableExtraChecks = isDebugMode;
