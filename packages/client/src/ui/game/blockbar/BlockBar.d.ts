interface OwnProps {
  readonly onBlockSelected: (slotId: number) => void;
  readonly selected: number;
}

const BlockBar: (props: OwnProps) => JSX.Element;
export default BlockBar;
