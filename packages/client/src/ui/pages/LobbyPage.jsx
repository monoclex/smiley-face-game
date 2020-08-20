//@ts-check
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import SvgIcon from "@material-ui/core/SvgIcon";
import RefreshIcon from "mdi-material-ui/Refresh";
import PlusIcon from "mdi-material-ui/Plus";
//@ts-ignore
import DiscordLogo from "@/assets/discord.svg";
import CreateRoomDialog from "@/ui/components/CreateRoomDialog";
import { Room } from "@/ui/lobby/Room";
import history from "@/ui/history";
import Loading from "@/ui/Loading";
import { api } from "@/isProduction";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  input: {
    textAlign: "center",
  },
  paddingStyle: {
    // https://material-ui.com/components/grid/#negative-margin
    padding: /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
  },
});

export default () => {
  const token = localStorage.getItem("token");

  if (token === null) {
    history.push("/");
    return null;
  }

  const classes = useStyles();

  const [roomPreviews, setRoomPreviews] = useState(undefined);
  const [myRooms, setMyRooms] = useState(undefined);
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);

  const refresh = () => {
    setRoomPreviews(undefined);
    setMyRooms(undefined);
    api.getLobby(token).then(setRoomPreviews);
    api.getMyRooms(token).then(({ ownedWorlds }) => { if (Array.isArray(ownedWorlds)) { setMyRooms(ownedWorlds); } });
  };

  // TODO: bring in stuff from old lobby component to here
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Grid container item justify="center" alignItems="center">
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
        <Grid container spacing={3} justify="center" alignItems="flex-start">
          {!roomPreviews && <Loading message={"Loading rooms..."} />}
          {!!roomPreviews && roomPreviews.map((room) => (
            <Grid item key={room.id}>
              <Room room={room} />
            </Grid>
          ))}

        </Grid>

{myRooms && <Typography variant="h3" component="h1" style={{ textAlign: "center" }}>
  Your Rooms
</Typography>}

        {myRooms && <Grid container spacing={3} justify="center" alignItems="flex-start">
          {!myRooms && <Loading message={"Loading your rooms..."} />}
          {!!myRooms && myRooms.map((room) => (
            <Grid item key={room.id}>
              <Room room={room} />
            </Grid>
          ))}
        </Grid>}
      </div>

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        onCreateRoom={({ width, height, name }) => {
          history.push(`/games/?name=${encodeURIComponent(name)}&width=${width}&height=${height}`);
          setCreateRoomDialogOpen(false);
        }}
      />
    {/*
      <a onClick={() => history.push("/games/?name=ROOM&width=50&height=50&token=" + encodeURIComponent(token))}>
        new room
      </a>
      {onlineRooms.map(preview => (
        <div>
          <p>{ preview.name } - { preview.playerCount } online.</p>
          <a onClick={() => history.push("/games/" + preview.id + "?type=" + preview.type + "&token=" + encodeURIComponent(token))}>
            play now
          </a>
        </div>
      ))}
      */}
    </>
  );
};
