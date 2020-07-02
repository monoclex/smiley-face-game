import React, { Suspense } from "react";
// import store from "./redux/store";
import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { lazy } from "react";

interface AppProps {}

const LobbyPageLazy = lazy(() => import("./lobby/Lobby"));
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
