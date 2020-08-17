//@ts-check
import React, { Suspense, lazy, useMemo } from "react";
import { Router, Route } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { Provider } from "react-redux";
import store from "./redux/store";
import Lobby from "./lobby/Lobby";
import Loading from "./Loading";
import history from "@/ui/history";

const LobbyPage = Lobby; // 'Lobby' is barely 5KiB non gzipped - not worth making lazy, and it has high chance of being hit anyways

// HUGE - make lazy
const GamePage = lazy(() => import("./game/Game"));

// low chance of being hit, lazy it
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GuestPage = lazy(() => import("./pages/GuestPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));

export const App = () => {
  const prefersDarkMode = true;

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <Router history={history}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={Loading}>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/guest" component={GuestPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/auth" component={AuthPage} />

            {/* 
                Temporary hack to allow people to join without width/height
                (will deal with this later)
            */}
            <Route exact path="/games/:roomId" render={({ match }) => <GamePage roomId={match.params.roomId} />} />
            <Route
              exact
              path="/games/:roomId/:width/:height"
              render={({ match }) => (
                <GamePage
                  roomId={match.params.roomId}
                  roomWidth={match.params.width}
                  roomHeight={match.params.height}
                />
              )}
            />
          </Suspense>
        </ThemeProvider>
      </Provider>
    </Router>
  );
};
