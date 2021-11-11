//@ts-check
import React, { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styled } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import SvgIcon from "@mui/material/SvgIcon";
import Plus from "mdi-material-ui/Plus";
import Refresh from "mdi-material-ui/Refresh";
import Cart from "mdi-material-ui/Cart";
import DiscordLogo from "../../assets/discord.svg";
import CreateRoomDialog from "../../ui/components/CreateRoomDialog";
import { Room } from "../../ui/lobby/Room";
import FullscreenBackdropLoading from "../components/FullscreenBackdropLoading";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router";
import { useAuth, useToken } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import LogoutIcon from "../icons/LogoutIcon";

const PaddedContainer = styled("div")({
  // https://material-ui.com/components/grid/#negative-margin
  padding: /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
});

const LobbyPage = () => {
  const history = useHistory();
  const [_, setToken] = useToken();
  const auth = useAuth();

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

      setToken(false);
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
    setToken(false);
    history.push("/");
  };

  // TODO: bring in stuff from old lobby component to here
  useEffect(() => {
    refresh();
  }, []);

  return (
    <>
      <Grid container item justifyContent="center" alignItems="center">
        <IconButton onClick={logout} size="large">
          <LogoutIcon />
        </IconButton>
        <motion.div whileTap={{ rotate: 360, transition: { duration: 0.25 } }}>
          <IconButton onClick={() => refresh()} size="large">
            <Refresh />
          </IconButton>
        </motion.div>
        <IconButton onClick={() => setCreateRoomDialogOpen(true)} size="large">
          <Plus />
        </IconButton>
        <IconButton onClick={() => history.push("/shop")} size="large">
          <Cart />
        </IconButton>
        <IconButton onClick={() => window.open("https://discord.gg/c68KMCs")} size="large">
          <SvgIcon component={DiscordLogo} viewBox="0 0 256 256" />
        </IconButton>
      </Grid>
      <PaddedContainer>
        <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
          {!roomPreviews && <FullscreenBackdropLoading message={"Loading rooms..."} />}
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
            {!myRooms && <FullscreenBackdropLoading message={"Loading your rooms..."} />}
            {!!myRooms &&
              myRooms.map((room) => (
                <Grid item key={room.id}>
                  <Room room={room} />
                </Grid>
              ))}
          </Grid>
        )}
      </PaddedContainer>

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        onCreateRoom={({ width, height, name }) => {
          history.push(`/games/loading`, { type: "create", name, width: parseInt(width), height: parseInt(height) });
          setCreateRoomDialogOpen(false);
        }}
      />
    </>
  );
};

const LobbyPageWrapper = () => {
  return (
    <Suspense fallback={<FullscreenBackdropLoading />}>
      <ErrorBoundary>
        <LobbyPage />
      </ErrorBoundary>
    </Suspense>
  );
};

export default LobbyPageWrapper;
