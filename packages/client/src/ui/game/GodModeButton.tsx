//@ts-check
import React, { useRef } from "react";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material";
import { Helicopter } from "mdi-material-ui";
import { useGameState } from "../hooks";
import { useSelf } from "@/hooks";

const Clickable = styled(IconButton)({
  pointerEvents: "all",
});

const GodModeButton = () => {
  const game = useGameState();

  const ref = useRef<HTMLButtonElement>(null);

  const mainPlayer = useSelf();
  if (!mainPlayer.canGod) return null;

  const triggerGod = () => {
    if (ref.current !== null) ref.current.blur();
    game.keyboard.triggerGod();
  };

  return (
    <>
      <Clickable
        ref={ref}
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
