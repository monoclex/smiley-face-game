import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  CardActionArea,
  CardMedia,
  CardActions,
  Tooltip,
  IconButton,
} from "@material-ui/core";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ThumbUp as ThumbUpIcon, HeartOutline as HeartOutlineIcon, Play as PlayIcon } from "mdi-material-ui";

import minimapImage from "./minimap.png";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    minWidth: 175,
    maxWidth: 600,
  },
  content: {
    flex: "1 0 auto",
  },
  media: {
    width: 175,
    height: 175,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

interface RoomProps {
  room: GamePreview;
}

// TODO: import from libcore
interface GamePreview {
  id: string;
  playerCount: number;
}

export const Room: React.FC<RoomProps> = (props) => {
  const classes = useStyles();

  return (
    <motion.div whileHover={{ scale: 1.1 }}>
      <Card className={classes.root}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {props.room.id}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {props.room.id}
            </Typography>
          </CardContent>

          <CardActions disableSpacing className={classes.controls}>
            <Tooltip title="Like">
              <IconButton aria-label="add-or-remove">
                <ThumbUpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add to favorites">
              <IconButton aria-label="favorite">
                <HeartOutlineIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Join the room!">
              <Link to={`/games/${props.room.id}`}>
                <IconButton aria-label="play">
                  <PlayIcon />
                </IconButton>
              </Link>
            </Tooltip>
          </CardActions>
        </div>

        <CardMedia className={classes.media} image={minimapImage} title={props.room.id} />
      </Card>
    </motion.div>
  );
};

Room.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    playerCount: PropTypes.number.isRequired
  }).isRequired
};
