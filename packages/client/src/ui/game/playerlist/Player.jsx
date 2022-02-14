//@ts-check
import React, { useState } from "react";
import { Grid, MenuItem, styled, ToggleButton } from "@mui/material";
import { useRecoilValue } from "recoil";
import Menu from "@mui/material/Menu/Menu";
import Pencil from "mdi-material-ui/Pencil";
import ShoeCleat from "mdi-material-ui/ShoeCleat";
import { currentPlayerState } from "../../../state";
import { useSnackbar } from "notistack";
import { useGameState } from "../../hooks";
import AccountCowboyHat from "mdi-material-ui/AccountCowboyHat";
import AccountTie from "mdi-material-ui/AccountTie";
import AccountEdit from "mdi-material-ui/AccountEdit";
import Helicopter from "mdi-material-ui/Helicopter";

const PlayerDisplay = styled("div")(({ theme }) => ({
  // clsx(classes.hoverable
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  // , classes.message)
  paddingTop: 6,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(2),

  display: "flex",
  alignItems: "center",
}));

const NoIcon = styled("div")({
  // clsx(classes.noRole
  // , classes.userIconPadding)
  marginRight: 4,
});

const MarginRightSpan = styled("span")({
  marginRight: 4,
});

export const Player = ({ username, id: playerId, role: roleParam, canGod }) => {
  const { connection } = useGameState();
  if (!connection) throw new Error("impossible state");

  const { enqueueSnackbar } = useSnackbar();

  /** @type {import("@smiley-face-game/api/types").ZRole} */
  const role = roleParam;

  // https://material-ui.com/components/menus/#SimpleMenu.js
  const [anchorElement, setAnchorElement] = useState(null);

  const mainPlayer = useRecoilValue(currentPlayerState);

  /** @type {JSX.Element[]} */
  const actions = [];

  const kick = () => {
    connection.kick(playerId);
    enqueueSnackbar(`Kicked ${username}`, {
      variant: "success",
    });
  };

  const setEdit = (shouldHaveEdit) => {
    // can't change edit if not owner
    if (mainPlayer.role !== "owner") return;

    if (shouldHaveEdit) {
      connection.giveEdit(playerId);
    } else {
      connection.takeEdit(playerId);
    }

    enqueueSnackbar(
      `${shouldHaveEdit ? "Gave" : "Took"} edit ${shouldHaveEdit ? "to" : "from"} ${username}`,
      {
        variant: "success",
      }
    );
  };

  const setGod = (shouldHaveGod) => {
    // can't change edit if not owner
    if (mainPlayer.role !== "owner") return;

    if (shouldHaveGod) {
      connection.giveGod(playerId);
    } else {
      connection.takeGod(playerId);
    }

    enqueueSnackbar(
      `${shouldHaveGod ? "Gave" : "Took"} god ${shouldHaveGod ? "to" : "from"} ${username}`,
      {
        variant: "success",
      }
    );
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

      actions.push(
        <ToggleButton
          value="god"
          aria-label="god"
          selected={canGod}
          onChange={() => setGod(!canGod)}
        >
          <Helicopter />
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
      <PlayerDisplay onClick={handleClick}>
        {role === "non" ? (
          <NoIcon />
        ) : (
          <MarginRightSpan>
            {role === "edit" && <AccountEdit onClick={() => setEdit(false)} />}
            {role === "owner" && <AccountTie />}
            {role === "staff" && <AccountCowboyHat />}
          </MarginRightSpan>
        )}
        {canGod && (
          <MarginRightSpan>
            <Helicopter />
          </MarginRightSpan>
        )}

        <span>{username}</span>
      </PlayerDisplay>
      <Menu
        id={`player-${playerId}-${username}`}
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
