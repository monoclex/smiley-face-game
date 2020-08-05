import * as React from "react";
import { useState, useEffect } from "react";
import { Room } from "./Room";
import { Grid, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlusIcon from "mdi-material-ui/Plus";
import RefreshIcon from "mdi-material-ui/Refresh";
import LoginIcon from "mdi-material-ui/Login";
import { withRouter, Redirect } from "react-router-dom";
import { api } from "../../isProduction";
import CreateRoomDialog from "../components/CreateRoomDialog";
import { motion } from "framer-motion";
import history from "../history";

const useStyles = makeStyles({
  input: {
    textAlign: "center",
  },
  paddingStyle: {
    // https://material-ui.com/components/grid/#negative-margin
    padding: /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
  },
});

// TODO: import from libcore
interface RoomPreview {
  id: string;
  playerCount: number;
}

const Lobby = () => {
  const classes = useStyles();

  const [redirect, setRedirect] = useState<string | undefined>();
  const [roomPreviews, setRoomPreviews] = useState<RoomPreview[] | undefined>();
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);

  const fetchLobby =
    () => fetch(api.lobby())
      .then((response) => response.json())
      .then(setRoomPreviews);

  useEffect(() => {
    fetchLobby();
  }, []);

  const gotoLogin = () => setRedirect("/login");

  // this is omega wtf but it doesn't work unless i do this... ?????????
  if (redirect) {
    return <Redirect to={redirect} />;
  }

  if (!roomPreviews) {
    return <h1>Loading rooms...</h1>;
  }

  return (
    <>
      <Grid container item justify="center" alignItems="center">
        <motion.div whileTap={{ rotate: 360, transition: { duration: 0.25 } }}>
          <IconButton onClick={() => fetchLobby()}>
            <RefreshIcon />
          </IconButton>
        </motion.div>
        <IconButton onClick={() => setCreateRoomDialogOpen(true)}>
          <PlusIcon />
        </IconButton>
        <IconButton onClick={() => gotoLogin()}>
          <LoginIcon />
        </IconButton>
      </Grid>
      <div className={classes.paddingStyle}>
        <Grid container spacing={3} justify="center" alignItems="flex-start">
          {roomPreviews.map((room) => (
            <Grid item key={room.id}>
              <Room room={room} />
            </Grid>
          ))}
        </Grid>
      </div>

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        onCreateRoom={({ width, height, name }) => {
          setRedirect(`/games/${name.replace(/ /g, "-")}/${width}/${height}`);
          setCreateRoomDialogOpen(false);
        }}
      />
    </>
  );
};

export default withRouter(Lobby);
