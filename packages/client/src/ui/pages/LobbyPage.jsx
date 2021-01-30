import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import SvgIcon from "@material-ui/core/SvgIcon";
import RefreshIcon from "mdi-material-ui/Refresh";
import PlusIcon from "mdi-material-ui/Plus";
import DiscordLogo from "../../assets/discord.svg";
import CreateRoomDialog from "../../ui/components/CreateRoomDialog";
import { Room } from "../../ui/lobby/Room";
import history from "../../ui/history";
import Loading from "../../ui/Loading";
import Typography from "@material-ui/core/Typography";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { useSnackbar } from "notistack";
import { Authentication } from "@smiley-face-game/api";

const useStyles = makeStyles({
  input: {
    textAlign: "center",
  },
  paddingStyle: {
    // https://material-ui.com/components/grid/#negative-margin
    padding: /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
  },
  rotate180: {
    // https://github.com/Dogfalo/materialize/issues/3732#issuecomment-251741094
    transform: "rotate(180deg)",
  },
});

const LobbyPage = () => {
  const token = localStorage.getItem("token");

  if (token === null) {
    history.push("/");
    return null;
  }

  const auth = new Authentication(token);

  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [roomPreviews, setRoomPreviews] = useState(undefined);
  const [myRooms, setMyRooms] = useState(undefined);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);

  const refresh = () => {
    setRoomPreviews(undefined);
    setMyRooms(undefined);

    let didExit = false;
    const exit = (err) => {
      if (didExit) return;
      didExit = true;

      console.warn("one GET yielded error", err, err.issues);
      enqueueSnackbar("Logged out - invalid token", {
        variant: "error",
        autoHideDuration: 3000,
      });

      localStorage.removeItem("token");
      history.push("/");
    };

    auth.lobby().then(setRoomPreviews).catch(exit);
    auth
      .player()
      .then(({ ownedWorlds }) => {
        if (Array.isArray(ownedWorlds)) {
          setMyRooms(ownedWorlds);
        }
      })
      .catch(exit);
  };

  const logout = () => {
    // TODO: ask the server to invalidate the token
    localStorage.removeItem("token");
    history.push("/");
  };

  // TODO: bring in stuff from old lobby component to here
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Grid container item justifyContent="center" alignItems="center">
        <IconButton className={classes.rotate180} onClick={logout}>
          <ExitToAppIcon />
        </IconButton>
        <motion.div whileTap={{ rotate: 360, transition: { duration: 0.25 } }}>
          <IconButton onClick={() => refresh()}>
            <RefreshIcon />
          </IconButton>
        </motion.div>
        <IconButton onClick={() => setCreateRoomDialogOpen(true)}>
          <PlusIcon />
        </IconButton>
        <IconButton onClick={() => window.open("https://discord.gg/c68KMCs")}>
          <SvgIcon component={DiscordLogo} viewBox="0 0 256 256" />
        </IconButton>
      </Grid>
      <div className={classes.paddingStyle}>
        <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
          {!roomPreviews && <Loading message={"Loading rooms..."} />}
          {!!roomPreviews &&
            roomPreviews.map((room) => (
              <Grid item key={room.id}>
                <Room room={room} />
              </Grid>
            ))}
        </Grid>

        {myRooms && (
          <Typography variant="h3" component="h1" style={{ textAlign: "center" }}>
            Your Rooms
          </Typography>
        )}

        {myRooms && (
          <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
            {!myRooms && <Loading message={"Loading your rooms..."} />}
            {!!myRooms &&
              myRooms.map((room) => (
                <Grid item key={room.id}>
                  <Room room={room} />
                </Grid>
              ))}
          </Grid>
        )}
      </div>

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        onCreateRoom={({ width, height, name }) => {
          history.createGame(name, parseInt(width), parseInt(height));
          setCreateRoomDialogOpen(false);
        }}
      />
    </>
  );
};

export default LobbyPage;
