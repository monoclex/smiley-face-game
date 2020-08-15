import { ConnectedComponent } from "react-redux";

interface OwnProps {
  readonly roomId: string;
  readonly roomWidth?: number;
  readonly roomHeight?: number;
}

const Game: (props: OwnProps) => JSX.Element;
export default Game;
