function getMode() {
  if (import.meta.env.SERVER_MODE === "localhost") return "localhost" as const;
  if (import.meta.env.SERVER_MODE === "development") return "development" as const;
  if (import.meta.env.SERVER_MODE === "production") return "production" as const;
  throw new Error("Webpack incorrectly configured!");
}

export const serverMode = getMode();
export const isDebugMode = serverMode === "localhost";
