import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    maxWidth: 400,
  }
})

interface RoomProps {
  room: GamePreview;
}

// TODO: import from libcore
interface GamePreview {
  id: string;
  playerCount: number;
}

export const Room: React.FC<RoomProps> = (props) => {
  const styles = useStyles();

  return (
    <Card className={styles.root}>
      <CardContent>
        <Typography variant="body2" component="p">
          {props.room.id}
        </Typography>
      </CardContent>
    </Card>
  );
};
