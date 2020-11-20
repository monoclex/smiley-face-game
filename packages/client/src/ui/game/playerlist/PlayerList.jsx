import React, { useEffect, useRef, useState } from "react";
import { Divider, Paper, Grid, MenuItem, Checkbox } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { motion } from "framer-motion";
import clsx from "clsx";
import { SizeMe } from "react-sizeme";
import { playerListState } from "../../../recoil/atoms/playerList";
import { useRecoilValue } from "recoil";
import Menu from "@material-ui/core/Menu/Menu";
import commonUIStyles from "../commonUIStyles";
import SpringScrollbars from "../../../ui/components/SpingScrollbars";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import { Pencil, ShoeCleat } from "mdi-material-ui";
import currentPlayer from "../../../recoil/selectors/currentPlayer";
import ToggleButton from "@material-ui/lab/ToggleButton/ToggleButton";
import { useSnackbar } from "notistack";

// so much stupid boilerplate
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserAstronaut, faUserEdit, faUserTie } from "@fortawesome/free-solid-svg-icons";

library.add(faUserAstronaut);
library.add(faUserEdit);
library.add(faUserTie);

const useStyles = makeStyles((theme) => ({
  container: {
    ...commonUIStyles.uiOverlayElement,
    paddingRight: 5,
    overflow: "hidden",
  },
  paper: {
    pointerEvents: "none",
    minWidth: 10,
  },
  alignText: {
    textAlign: "left",
  },
  chatList: {
    overflow: "auto",
    maxHeight: "100%",
    pointerEvents: "all",
  },
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
  noRole: {
    width: "0.875em",
    height: "1em",
    display: "inline-block",
  },
  hide: {
    visibility: "hidden",
  },
  hoverable: {
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const Player = ({ username, playerId, role: roleParam }) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  /** @type {import("@smiley-face-game/api/PlayerRole").default} */
  const role = roleParam;

  // https://material-ui.com/components/menus/#SimpleMenu.js
  const [anchorElement, setAnchorElement] = useState(null);

  const mainPlayer = useRecoilValue(currentPlayer) ?? { username: "", role: "non", playerId: -1 };

  const handleClick = (event) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const setEdit = (shouldHaveEdit) => {
    if (shouldHaveEdit) {
      window.gameScene.connection.giveEdit(playerId);
    } else {
      window.gameScene.connection.takeEdit(playerId);
    }

    enqueueSnackbar(`${shouldHaveEdit ? "Gave" : "Took"} edit ${shouldHaveEdit ? "to" : "from"} ${username}`, {
      variant: "success",
    });
  };

  const kick = () => {
    window.gameScene.connection.kick(playerId);
    enqueueSnackbar(`Kicked ${username}`, {
      variant: "success",
    });
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
        <Grid container justify="center" direction="column">
          {mainPlayer.role === "owner" && (
            <>
              <ToggleButton
                value="edit"
                aria-label="edit"
                selected={role === "edit"}
                onChange={() => setEdit(!(role === "edit"))}
              >
                <Pencil />
              </ToggleButton>
              <MenuItem onClick={kick}>
                <ShoeCleat />
              </MenuItem>
            </>
          )}
        </Grid>
      </Menu>
    </>
  );
};

export default ({}) => {
  const classes = useStyles();
  const [duration, setDuration] = useState(0);

  // for duration, we want to set the duration back to 0.3 once it's done
  // so we set the duration to 0.3 at some point *later*, so that the animation duration is correct
  useEffect(() => {
    setTimeout(() => {
      setDuration(0.3);
    });
  }, []);

  const { players } = useRecoilValue(playerListState);

  return (
    <Grid container justify="flex-end" alignItems="center" className={classes.container}>
      <Grid item>
        <SizeMe>
          {({ size }) => (
            <motion.div
              // if we don't have the size yet, hide the component so that
              // instead of being fully visible and then getting shifted to the right side of the screen,
              // it goes from being invisible to popping up. it makes it less jarring
              className={clsx(!size.width && classes.hide)}
              // the '0' never matters here. we just ensure we have the size
              animate={{ translateX: size.width ? size.width - 30 : 0 }}
              // while we hover, we reset the tranlateX thing we did
              whileHover={{ translateX: 0 }}
              // if we don't set the duration of the transition to 0 initially, as soon as the component becomes visible it'll
              // still be jarring and make the jump. see where duration is defined for more info
              transition={{ duration }}
            >
              <Paper className={classes.paper}>
                <Grid container direction="column">
                  <Grid item>
                    <SpringScrollbars
                      className={classes.chatList}
                      autoHeight
                      autoHeightMin={0}
                      autoHeightMax={400}
                      autoHide
                      autoHideTimeout={1000}
                      autoHideDuration={200}
                    >
                      {players.map((player, i) => (
                        <Player key={i} {...player} />
                      ))}
                    </SpringScrollbars>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          )}
        </SizeMe>
      </Grid>
    </Grid>
  );
};
