import * as React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    maxWidth: 400,
  }
});

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

Room.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    playerCount: PropTypes.number.isRequired
  }).isRequired
};
