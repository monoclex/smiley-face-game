declare module "*.png" {
  const url: string;
  export = url;
}

declare module "*.json" {
  const payload: object;
  export = payload;
}

declare module "*.mp3" {
  const url: string;
  export = url;
}

declare module "*.svg" {
  // eslint-disable-next-line no-undef
  const SvgComponent: () => JSX.Element;
  export = SvgComponent;
}

declare module "*.scss" {
  const styles: Record<string, string>;
  export = styles;
}

interface ImportMeta {
  env: {
    NODE_ENV: string;
    SERVER_MODE: "localhost" | "development" | "production";
  };
}
