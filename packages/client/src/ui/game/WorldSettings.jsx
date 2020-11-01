import React, { useEffect, useRef, useState } from "react";
import { Divider, Paper, Grid, MenuItem, Checkbox } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useRecoilValue } from "recoil";
import { Cog } from "mdi-material-ui";
import currentPlayer from "../../recoil/selectors/currentPlayer";
import Menu from "@material-ui/core/Menu/Menu";
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles({
  cog: {
    pointerEvents: "all",
  },
});

export default ({}) => {
  const classes = useStyles();
  const mainPlayer = useRecoilValue(currentPlayer) ?? { username: "", role: "non", playerId: -1 };
  const [anchorEl, setAnchorEl] = React.useState(null);

  const save = () => {
    window.gameScene.networkClient.save();
    setAnchorEl(null); // closes menu
  };

  const load = () => {
    window.gameScene.networkClient.load();
    setAnchorEl(null); // closes menu
  };

  return (
    <>
      <IconButton
        variant="contained"
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className={classes.cog}
        color="primary"
        aria-label="world settings"
        component="span"
      >
        <Cog />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={save}>Save</MenuItem>
        <MenuItem onClick={load}>Load</MenuItem>
      </Menu>
    </>
  );
};
