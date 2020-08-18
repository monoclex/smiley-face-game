//@ts-check
import React, { Suspense, lazy, useMemo } from "react";
import { Router, Route } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { Provider } from "react-redux";
import store from "./redux/store";
import Loading from "./Loading";
import history from "@/ui/history";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GuestPage = lazy(() => import("./pages/GuestPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LobbyPage = lazy(() => import("./pages/LobbyPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));

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
          <Suspense fallback={<Loading />}>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/guest" component={GuestPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/lobby" component={LobbyPage} />
            <Route exact path="/games/:roomId" component={PlayPage} />
            <Route exact path="/games/" component={PlayPage} />
            {/* TODO: /games/:roomId route */}
          </Suspense>
        </ThemeProvider>
      </Provider>
    </Router>
  );
};
