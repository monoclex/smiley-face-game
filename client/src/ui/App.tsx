import React, { Suspense } from "react";
import store from "./redux/store";
import { CssBaseline } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { lazy } from "react";
import Lobby from "./lobby/Lobby";
import { Provider } from "react-redux";

interface AppProps {}

const LobbyPage = Lobby; // 'Lobby' is barely 5KiB non gzipped - not worth making lazy
const GamePage = lazy(() => import("./game/Game"));

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
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<h1>Loading...</h1>}>
              <Route exact path="/" component={LobbyPage} />

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
    </>
  );
};
