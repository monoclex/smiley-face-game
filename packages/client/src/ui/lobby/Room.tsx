//@ts-check
import React from "react";
import {
  Card,
  styled,
  CardContent,
  Typography,
  CardMedia,
  CardActions,
  Tooltip,
  IconButton,
} from "@mui/material";
// import ThumbUpIcon from "mdi-material-ui/ThumbUp";
// import HeartOutlineIcon from "mdi-material-ui/HeartOutline";
import PlayIcon from "mdi-material-ui/Play";
import { motion } from "framer-motion";
import minimapImage from "./minimap.png";
import type { ZGamePreview } from "@smiley-face-game/api/api";
import { useNavigate } from "react-router";
import { gameRunningState } from "../../bridge/state";

const CardRoot = styled(Card)({
  display: "flex",
  cursor: "pointer",
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
  const navigate = useNavigate();
  const {
    room: { id, name, playerCount },
  } = props;

  const play = (e) => {
    gameRunningState.set(undefined);
    navigate(`/games/${id}`, { state: { type: "join", id } });
    e.cancelDefault();
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }}>
      <CardRoot onClick={play}>
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
            {/* <Tooltip title="Like">
              <IconButton aria-label="add-or-remove" size="large">
                <ThumbUpIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Add to favorites">
              <IconButton aria-label="favorite" size="large">
                <HeartOutlineIcon />
              </IconButton>
            </Tooltip> */}

            <Tooltip title="Join the room!">
              <IconButton aria-label="play" onClick={play} size="large">
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
