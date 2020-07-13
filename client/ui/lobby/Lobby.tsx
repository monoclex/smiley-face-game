import * as React from "react";
import { useState, useEffect } from "react";
import { Room } from "./Room";
import { Grid, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Plus as PlusIcon, Refresh as RefreshIcon } from "mdi-material-ui";
import { withRouter } from "react-router-dom";
import { api } from "../../isProduction";
import CreateRoomDialog from "../components/CreateRoomDialog";
import { motion } from "framer-motion";

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
interface GamePreview {
  id: string;
  playerCount: number;
}

const Lobby: React.FC<Record<string, unknown>> = () => {
  const classes = useStyles();

  const [rooms, setRooms] = useState<GamePreview[] | null>(null);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);

  const fetchLobby = () => {
    fetch(api.lobby())
      .then((response) => response.json())
      .then(setRooms);
  };

  useEffect(() => {
    fetchLobby();
  }, []);

  if (rooms === null) {
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
      </Grid>
      <div className={classes.paddingStyle}>
        <Grid container spacing={3} justify="center" alignItems="flex-start">
          {rooms.map((room) => (
              <Grid key={room.id} item xs={3}>
                <Link to={`/games/${room.id}`}>
                  <Room room={room} />
                </Link>
              </Grid>
            ))}
        </Grid>
      </div>

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        onCreateRoom={({ width, height, name }) => {
          history.push(`/games/${name.replace(/ /g, "-")}/${width}/${height}`);
          setCreateRoomDialogOpen(false);
        }}
      />
    </>
  );
};

export default withRouter(Lobby);
