import * as React from "react";
import { useEffect } from "react";
import * as ReactDOM from "react-dom";
import { globalVariableParkour } from "../scenes/loading/LoadingScene";
import { Grid } from "@material-ui/core";

interface IGameProps {
  config: Phaser.Types.Core.GameConfig;
  gameId: string;
}

export const Game: React.FC<IGameProps> = (props) => {
  const gameRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    // disable right click for context menu
    gameRef.current.oncontextmenu = () => false;

    // idk how to send state to the initial scene of phaser, so let's do some GLOBAL VARIABLE PARKOUR!
    globalVariableParkour.worldId = props.gameId;

    // start game
    const game = new Phaser.Game({ ...props.config, parent: gameRef.current });
  }, []);

  return (
    <Grid container item justify="center">
      <div ref={gameRef} />
    </Grid>
  );
}