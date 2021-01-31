import React, { useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useRecoilValue, useRecoilState } from "recoil";
import Cog from "mdi-material-ui/Cog";
import IconButton from "@material-ui/core/IconButton";
import WorldSettingsDialog from "./WorldSettingsDialog";
import { settingsOpenState, currentPlayerState } from "../../state";

const useStyles = makeStyles({
  cog: {
    pointerEvents: "all",
  },
});

const WorldSettingsButton = ({}) => {
  const classes = useStyles();
  const mainPlayer = useRecoilValue(currentPlayerState);
  const ref = useRef();

  const [open, setOpen] = useRecoilState(settingsOpenState);
  const onClose = () => setOpen(false);
  const doOpen = () => {
    ref.current.blur(); // un-focus cog
    setOpen(true);
  };

  // if the player isn't the owner, they shouldn't have access to world settings
  if (mainPlayer === undefined || mainPlayer.role !== "owner") {
    return null;
  }

  return (
    <>
      <IconButton
        ref={ref}
        variant="contained"
        aria-haspopup="true"
        onClick={doOpen}
        className={classes.cog}
        color="primary"
        aria-label="world settings"
        component="span"
      >
        <Cog />
      </IconButton>
      <WorldSettingsDialog open={open} onClose={onClose} />
    </>
  );
};

export default WorldSettingsButton;
