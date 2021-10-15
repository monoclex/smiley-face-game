const isProduction = import.meta.env.NODE_ENV === "production";
export default isProduction;

export const isDev = import.meta.env.DEV === true;
