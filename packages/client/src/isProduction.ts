const isProduction = process.env.NODE_ENV === "production";
export default isProduction;

//@ts-ignore
export const isDev = process.env.DEV === true;
