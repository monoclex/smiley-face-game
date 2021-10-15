//@ts-check
import * as React from "react";
import { Card, styled, CardContent, Typography, CardMedia, CardActions, Tooltip, IconButton } from "@mui/material";
import ThumbUpIcon from "mdi-material-ui/ThumbUp";
import HeartOutlineIcon from "mdi-material-ui/HeartOutline";
import PlayIcon from "mdi-material-ui/Play";
import { motion } from "framer-motion";
import minimapImage from "./minimap.png";
import history from "../../ui/history";
import type { ZGamePreview } from "@smiley-face-game/api/api";

const CardRoot = styled(Card)({
  display: "flex",
});

const Details = styled("div")({
  display: "flex",
  flexDirection: "column",
  minWidth: 175,
  maxWidth: 600,
});

const Content = styled(CardContent)({
  flex: "1 0 auto",
});

const Controls = styled(CardActions)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  paddingLeft: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

const Media = styled(CardMedia)({
  width: 175,
  height: 175,
});

type GamePreview = ZGamePreview;

type RoomProps = {
  room: GamePreview;
};

export const Room = (props: RoomProps) => {
  const {
    room: { id, name, playerCount },
  } = props;

  return (
    <motion.div whileHover={{ scale: 1.1 }}>
      <CardRoot>
        <Details>
          <Content>
            <Typography component="h5" variant="h5">
              {name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {playerCount} online
            </Typography>
          </Content>

          <Controls disableSpacing>
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
          </Controls>
        </Details>

        <Media image={minimapImage} title={id} />
      </CardRoot>
    </motion.div>
  );
};
