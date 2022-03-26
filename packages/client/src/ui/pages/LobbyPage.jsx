//@ts-check
import React, { Suspense, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
} from "@mui/material";
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
import { Navigate, useNavigate, use, useMatch, useLocation } from "react-router";
import { useAuth, usePlayer, useSetToken, useLobby, useRefresher } from "../hooks";
import ErrorBoundary from "../components/ErrorBoundary";
import LogoutIcon from "../icons/LogoutIcon";
import { gameRunningState } from "../../bridge/state";
import ConnectionError from "@smiley-face-game/api/net/ConnectionError";
import { ControllerClassic } from "mdi-material-ui";

const PaddedContainer = styled("div")({
  // https://material-ui.com/components/grid/#negative-margin
  padding:
    /* spacing */ (3 * /* 8 pixels */ 8) /* negative margin #2 '... apply at least half ...' */ / 2,
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
  const navigate = useNavigate();
  const logout = useLogout();
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const refresh = useRefresher();
  const { state } = useLocation();

  // TODO: bring in stuff from old lobby component to here
  useEffect(() => {
    refresh(location);
  }, []);

  return (
    <>
      <Grid container item justifyContent="center" alignItems="center">
        <motion.div whileTap={{ rotate: 360, transition: { duration: 0.25 } }}>
          <IconButton onClick={() => refresh()} size="large">
            <Refresh />
          </IconButton>
        </motion.div>
        <IconButton onClick={() => setCreateRoomDialogOpen(true)} size="large">
          <Plus />
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
          setCreateRoomDialogOpen(false);
          gameRunningState.set(undefined);
          navigate(`/games/loading`, {
            state: { type: "create", name, width: parseInt(width), height: parseInt(height) },
          });
        }}
      />

      <DisplayErrorAlert state={state} />
    </>
  );
};

function DisplayErrorAlert({ state }) {
  const navigate = useNavigate();
  const [openErr, setOpenErr] = useState(Boolean(state?.error));
  console.log("Lobby page got state", state?.error?.name);

  const closeError = () => {
    setOpenErr(false);

    // clear state
    navigate(`/lobby`, {
      replace: true,
      state: undefined,
    });
  };

  const snackbar = useSnackbar();

  let doEnqueue = false;
  useEffect(() => {
    if (!doEnqueue) return;
    snackbar.enqueueSnackbar("You have been disconnected!", {
      variant: "error",
    });
    closeError();
  }, []);

  if (state?.name === "DisconnectError") {
    doEnqueue = true;
    return null;
  }

  if (!openErr) return null;

  let body;

  console.error("joining world error:", state.error.name, state.error);

  if (state.name === "ConnectionError") {
    if (state.id.startsWith("D")) {
      body = (
        <Typography variant="body1" component="p">
          It appears the world you were trying to connect to was a <b>dynamic world</b>. It's very
          likely that we couldn't connect you to the world because that{" "}
          <b>world has already closed</b>. If you want to, you can create your own dynamic world by
          hitting the plus at the top of the lobby.
        </Typography>
      );
    } else if (state.id.startsWith("5")) {
      body = (
        <Typography variant="body1" component="p">
          It appears the world you were trying to connect to was a <b>saved world</b>. It's very
          likely that we couldn't connect you to the world because the ID is invalid. Check that the
          URL is properly well formed, and that there are no missing. replaced, or extraneous
          characters at the end of the URL.
        </Typography>
      );
    } else {
      body = (
        <Typography variant="body1" component="p">
          It appears the world you were trying to connect to a world, but <b>the ID is invalid</b>.
          Typically world IDs start with a <b>5</b> or a <b>D</b>, but yours starts with neither.
        </Typography>
      );
    }
  } else if (state.name === "ValidationError") {
    body = (
      <Typography variant="body1" component="p">
        It appears some piece of data was malformed while you were trying to connect to a world. It
        could be:
        <ul>
          <li>
            <b>The ID is malformed</b>: Check that the URL is properly well formed, and that there
            are no missing. replaced, or extraneous characters at the end of the URL.
          </li>
          <li>
            <b>The game has updated</b>: It is possible that your browser is caching old code, which
            does not recognize the newer datastructures an updated version of the game is using. Try
            press <b>CTRL + SHIFT + R</b> to perform a hard reload.
          </li>
        </ul>
      </Typography>
    );
  } else {
    body = (
      <Typography variant="body1" component="p">
        An unknown kind of error occurred. Report this to our development team in #bug-reports on
        discord.
        <br />
        {state.error.message}
        <br />
        <span style={{ fontFamily: "monospace" }}>{state?.error?.stack}</span>
      </Typography>
    );
  }

  return (
    <Dialog open={openErr} onClose={closeError}>
      <Alert severity="error">
        <AlertTitle>Connection Error</AlertTitle>
        {body}
        <br />
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Button
              onClick={() => {
                gameRunningState.set(undefined);
                navigate(`/games/${state.id}`);
              }}
            >
              Try Connect Again
            </Button>
            <Button onClick={closeError}>Ok</Button>
          </Grid>
        </Grid>
      </Alert>
    </Dialog>
  );
}

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
  return (
    <ErrorBoundary render={HandleError}>
      <LobbyPage />
    </ErrorBoundary>
  );
};

export default LobbyPageWrapper;
