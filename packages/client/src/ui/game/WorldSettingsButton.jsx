import React, { useEffect, useRef, useState } from "react";
import { Divider, Paper, Grid, MenuItem, Checkbox } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRecoilValue } from "recoil";
import { Cog } from "mdi-material-ui";
import currentPlayer from "../../recoil/selectors/currentPlayer";
import Menu from "@material-ui/core/Menu/Menu";
import IconButton from "@material-ui/core/IconButton";
import WorldSettingsDialog from "./WorldSettingsDialog";

const useStyles = makeStyles({
  cog: {
    pointerEvents: "all",
  },
});

const WorldSettingsButton = ({}) => {
  const classes = useStyles();
  const mainPlayer = useRecoilValue(currentPlayer);

  const [open, setOpen] = useState(false);
  const onClose = () => setOpen(false);

  // if the player isn't the owner, they shouldn't have access to world settings
  if (mainPlayer === undefined || mainPlayer.role !== "owner") {
    return null;
  }

  return (
    <>
      <IconButton
        variant="contained"
        aria-haspopup="true"
        onClick={() => setOpen(true)}
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
