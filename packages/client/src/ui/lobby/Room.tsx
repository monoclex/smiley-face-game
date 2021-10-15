import * as React from "react";
import { makeStyles } from "@mui/styles";
import { Card, CardContent, Typography, CardMedia, CardActions, Tooltip, IconButton } from "@mui/material";
import ThumbUpIcon from "mdi-material-ui/ThumbUp";
import HeartOutlineIcon from "mdi-material-ui/HeartOutline";
import PlayIcon from "mdi-material-ui/Play";
import { motion } from "framer-motion";
import minimapImage from "./minimap.png";
import history from "../../ui/history";
import type { ZGamePreview } from "@smiley-face-game/api/api";

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

type GamePreview = ZGamePreview;

type RoomProps = {
  room: GamePreview;
};

export const Room = (props: RoomProps) => {
  const {
    room: { id, name, playerCount },
  } = props;

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
              {playerCount} online
            </Typography>
          </CardContent>

          <CardActions disableSpacing className={classes.controls}>
            <Tooltip title="Like">
              <IconButton aria-label="add-or-remove" size="large">
                <ThumbUpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add to favorites">
              <IconButton aria-label="favorite" size="large">
                <HeartOutlineIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Join the room!">
              <IconButton aria-label="play" onClick={() => history.joinGame(id)} size="large">
                <PlayIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </div>

        <CardMedia className={classes.media} image={minimapImage} title={id} />
      </Card>
    </motion.div>
  );
};
