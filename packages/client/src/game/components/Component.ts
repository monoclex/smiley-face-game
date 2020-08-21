import ComponentDisplay from "./ComponentDisplay";

export default interface Component {
  readonly display: ComponentDisplay;
  readonly preUpdate?: () => void;
  readonly update?: () => void;
}
