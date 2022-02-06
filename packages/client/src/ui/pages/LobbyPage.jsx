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
import FullscreenBackdropLoading, { BigLoading } from "../components/FullscreenBackdropLoading";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import { Navigate, useNavigate } from "react-router";
import { useAuth, usePlayer, useSetToken, useLobby, useRefresher } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import LogoutIcon from "../icons/LogoutIcon";
import useTeardown from "../hooks/useTeardown";

const PaddedContainer = styled("div")({
  // https://material-ui.com/components/grid/#negative-margin
  padding: /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
});

function MyRooms() {
  const auth = useAuth();
  if (auth.isGuest) return null;

  const { ownedWorlds } = usePlayer();

  return (
    <>
      <Typography variant="h3" component="h1" style={{ textAlign: "center" }}>
        Your Rooms
      </Typography>

      <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
        {ownedWorlds.map((room) => (
          <Grid item key={room.id}>
            <Room room={room} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

function LobbyRooms() {
  const rooms = useLobby();

  return (
    <Grid container spacing={3} justifyContent="center" alignItems="flex-start">
      {rooms.map((room) => (
        <Grid item key={room.id}>
          <Room room={room} />
        </Grid>
      ))}
    </Grid>
  );
}

function RoomInfo() {
  return (
    <PaddedContainer>
      <Suspense fallback={<BigLoading message="Loading public rooms..." />}>
        <LobbyRooms />
      </Suspense>
      <Suspense fallback={<BigLoading message="Loading your rooms..." />}>
        <MyRooms />
      </Suspense>
    </PaddedContainer>
  );
}

function useLogout() {
  const navigate = useNavigate();
  const setToken = useSetToken();
  const { enqueueSnackbar } = useSnackbar();

  return () => {
    setToken(false);
    navigate("/");

    enqueueSnackbar("Logged out!", {
      variant: "success",
      autoHideDuration: 3000,
    });
  };
}

const LobbyPage = () => {
  console.log("hey we're at the lobby");
  const navigate = useNavigate();
  const logout = useLogout();
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const refresh = useRefresher();

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
        <IconButton onClick={() => navigate("/shop")} size="large">
          <Cart />
        </IconButton>
        <IconButton onClick={() => window.open("https://discord.gg/c68KMCs")} size="large">
          <SvgIcon component={DiscordLogo} viewBox="0 0 256 256" />
        </IconButton>
      </Grid>
      <RoomInfo />

      <CreateRoomDialog
        open={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        onCreateRoom={({ width, height, name }) => {
          navigate(`/games/loading`, { state: { type: "create", name, width: parseInt(width), height: parseInt(height) } });
          setCreateRoomDialogOpen(false);
        }}
      />
    </>
  );
};

function HandleError({ error }) {
  const setToken = useSetToken();
  const { enqueueSnackbar } = useSnackbar();

  console.warn("one GET yielded error", error, error.issues);
  enqueueSnackbar("Logged out - invalid token", {
    variant: "error",
    autoHideDuration: 3000,
  });

  setToken(false);
  return <Navigate to="/" />;
}

const LobbyPageWrapper = () => {
  const [callback, setCallback] = useState(() => () => {
    // we give a factory to an empty callback
    // this is so we infer the type of `callback` correctly
  });

  // run `callback` on component teardown
  useTeardown(() => callback, [callback]);

  return (
    <Suspense fallback={<FullscreenBackdropLoading />}>
      <ErrorBoundary callback={(recover) => setCallback(() => recover)} render={HandleError}>
        <LobbyPage />
      </ErrorBoundary>
    </Suspense>
  );
};

export default LobbyPageWrapper;
