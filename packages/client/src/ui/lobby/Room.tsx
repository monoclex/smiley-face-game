import * as React from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, Typography, CardMedia, CardActions, Tooltip, IconButton, } from "@material-ui/core";
import ThumbUpIcon from "mdi-material-ui/ThumbUp";
import HeartOutlineIcon from "mdi-material-ui/HeartOutline";
import PlayIcon from "mdi-material-ui/Play";
import { motion } from "framer-motion";
//@ts-ignore
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

// TODO: import from libcore
interface GamePreview {
  id: string;
  playerCount: number;
}

type RoomProps = {
  room: GamePreview;
};

export const Room = (props: RoomProps) => {
  const { room: { id } } = props;
  const name = id; // TODO: when rooms get their own name, use it instead

  const classes = useStyles();

  return (
    <motion.div whileHover={{ scale: 1.1 }}>
      <Card className={classes.root}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography component="h5" variant="h5">
              {name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {id}
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
              <Link to={`/games/${id}`}>
                <IconButton aria-label="play">
                  <PlayIcon />
                </IconButton>
              </Link>
            </Tooltip>
          </CardActions>
        </div>

        <CardMedia className={classes.media} image={minimapImage} title={id} />
      </Card>
    </motion.div>
  );
};
