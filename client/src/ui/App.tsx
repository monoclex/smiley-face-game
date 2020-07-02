import React, { Suspense } from "react";
// import store from "./redux/store";
import { CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { lazy } from "react";
import Lobby from "./lobby/Lobby";

interface AppProps {}

const LobbyPageLazy = Lobby; // 'Lobby' is barely 5KiB non gzipped - not worth making lazy
const GamePageLazy = lazy(() => import("./Game"));

export const App: React.FC<AppProps> = () => {
  const prefersDarkMode = true;

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  return (
    <>
      <Router>
        {/* TODO: use redux for state stuff if necessary */}
        {/* <Provider store={store}> */}
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Suspense fallback={<h1>Loading</h1>}>
            <Route exact path="/" component={LobbyPageLazy} />
            <Route
              exact
              path="/games/:gameId"
              render={({ match }) => <GamePageLazy gameId={match.params.gameId} />}
            />
          </Suspense>
        </ThemeProvider>
        {/* </Provider> */}
      </Router>
    </>
  );
};
