declare module "*.png" {
  const url: string;
  export = url;
}

declare module "*.json" {
  const payload: any;
  export = payload;
}

declare module "*.mp3" {
  const url: string;
  export = url;
}

declare module "*.svg" {
  const SvgComponent: () => JSX.Element;
  export = SvgComponent;
}
