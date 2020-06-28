import * as React from "react";
import * as ReactDOM from "react-dom";
import { Game } from "./Game";
import { Provider } from "react-redux";
// import store from "./redux/store";
import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";
import { Lobby } from "./lobby/Lobby";
import { BrowserRouter as Router, Route } from "react-router-dom";

interface AppProps {
  config: Phaser.Types.Core.GameConfig;
}

export const App: React.FC<AppProps> = (props) => {
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
          <Route exact path="/" component={Lobby} />
          <Route
            exact
            path="/games/:gameId"
            render={({ match }) => <Game config={props.config} gameId={match.params.gameId} />}
          />
        </ThemeProvider>
        {/* </Provider> */}
      </Router>
    </>
  );
};
