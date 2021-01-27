const isProduction = import.meta.env.NODE_ENV === "production";
export default isProduction;

//@ts-ignore
export const isDev = import.meta.env.DEV === true;
