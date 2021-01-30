import React, { useState } from "react";
import { Grid, MenuItem } from "@material-ui/core";
import clsx from "clsx";
import { useRecoilValue } from "recoil";
import Menu from "@material-ui/core/Menu/Menu";
import { Pencil, ShoeCleat } from "mdi-material-ui";
import { currentPlayerState } from "../../../state";
import ToggleButton from "@material-ui/lab/ToggleButton/ToggleButton";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { makeStyles } from "@material-ui/core/styles";
import state from "../../../bridge/state";

const useStyles = makeStyles((theme) => ({
  message: {
    paddingTop: 2,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 2,
    marginTop: 2,
    marginBottom: 2,
  },
  userIconPadding: {
    marginRight: 4,
  },
  hoverable: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const Player = ({ username, id: playerId, role: roleParam }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  /** @type {import("@smiley-face-game/api/types").ZRole} */
  const role = roleParam;

  // https://material-ui.com/components/menus/#SimpleMenu.js
  const [anchorElement, setAnchorElement] = useState(null);

  const mainPlayer = useRecoilValue(currentPlayerState);

  /** @type {JSX.Element[]} */
  const actions = [];

  const kick = () => {
    state.game.connection.kick(playerId);
    enqueueSnackbar(`Kicked ${username}`, {
      variant: "success",
    });
  };

  const setEdit = (shouldHaveEdit) => {
    // can't change edit if not owner
    if (mainPlayer.role !== "owner") return;

    if (shouldHaveEdit) {
      state.game.connection.giveEdit(playerId);
    } else {
      state.game.connection.takeEdit(playerId);
    }

    enqueueSnackbar(`${shouldHaveEdit ? "Gave" : "Took"} edit ${shouldHaveEdit ? "to" : "from"} ${username}`, {
      variant: "success",
    });
  };

  // make sure that when you add things to `actions` you can guarantee a static order
  // so that the `key` prop can be set to the index it's at in the array
  if (mainPlayer.role === "owner") {
    // TODO: when better role/permission handling, have this be set to where it shows up if they can't edit,
    // doing things based on role is hacky and weird
    if (role !== "owner") {
      actions.push(
        <ToggleButton
          value="edit"
          aria-label="edit"
          selected={role === "edit"}
          onChange={() => setEdit(!(role === "edit"))}
        >
          <Pencil />
        </ToggleButton>
      );
    }

    actions.push(
      <MenuItem onClick={kick}>
        <ShoeCleat />
      </MenuItem>
    );
  }

  const handleClick = (event) => {
    // don't show menu if there are no actions to perform
    if (actions.length === 0) return;
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  return (
    <>
      <div className={clsx(classes.hoverable, classes.message)} onClick={handleClick}>
        {role === "non" && <div className={clsx(classes.noRole, classes.userIconPadding)} />}
        {role === "edit" && (
          <FontAwesomeIcon className={classes.userIconPadding} icon="user-edit" onClick={() => setEdit(false)} />
        )}
        {role === "owner" && <FontAwesomeIcon className={classes.userIconPadding} icon="user-tie" />}
        {role === "staff" && <FontAwesomeIcon className={classes.userIconPadding} icon="user-astronaut" />}

        <span>{username}</span>
      </div>
      <Menu
        id={"player-" + username}
        anchorEl={anchorElement}
        keepMounted
        open={Boolean(anchorElement)}
        onClose={handleClose}
      >
        <Grid container justifyContent="center" direction="column">
          <>{actions.map((action, i) => ({ ...action, key: i }))}</>
        </Grid>
      </Menu>
    </>
  );
};
