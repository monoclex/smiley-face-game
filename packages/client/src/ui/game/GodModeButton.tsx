//@ts-check
import React from "react";
import { useRecoilValue } from "recoil";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material";
import { currentPlayerState } from "../../state";
import { Helicopter } from "mdi-material-ui";
import { useGameState } from "../hooks";

const Clickable = styled(IconButton)({
  pointerEvents: "all",
});

const GodModeButton = () => {
  const game = useGameState();

  const mainPlayer = useRecoilValue(currentPlayerState);
  if (!mainPlayer.canGod) return null;

  const triggerGod = () => game.keyboard.triggerGod();

  return (
    <>
      <Clickable
        // TODO: what does it want here?
        // variant="contained"
        aria-haspopup="true"
        onClick={triggerGod}
        color="primary"
        aria-label="world settings"
        // TODO: what does it want here?
        // component="span"
        size="large"
      >
        <Helicopter />
      </Clickable>
    </>
  );
};

export default GodModeButton;
