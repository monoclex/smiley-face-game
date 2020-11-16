import React, { Suspense, lazy, useMemo } from "react";
import { Router, Route } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline, Snackbar } from "@material-ui/core";
import { deepPurple, indigo } from "@material-ui/core/colors";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";

import Loading from "./Loading";
import history from "./history";
import { SnackbarUtilsConfigurator } from "../SnackbarUtils";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GuestPage = lazy(() => import("./pages/GuestPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LobbyPage = lazy(() => import("./pages/LobbyPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditions"));
const ShopPage = lazy(() => import("./pages/ShopPage"));

export const App = () => {
  const prefersDarkMode = true;

  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: indigo,
          secondary: deepPurple,
        },
      }),
    [prefersDarkMode]
  );

  return (
    <Router history={history}>
      <RecoilRoot>
        <SnackbarProvider maxSnack={15} autoHideDuration={1500}>
          <SnackbarUtilsConfigurator />
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<Loading />}>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/terms" component={TermsAndConditionsPage} />
              <Route exact path="/guest" component={GuestPage} />
              <Route exact path="/register" component={RegisterPage} />
              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/lobby" component={LobbyPage} />
              <Route exact path="/games/:roomId" component={PlayPage} />
              <Route exact path="/games/" component={PlayPage} />
              <Route exact path="/shop" component={ShopPage} />
            </Suspense>
          </ThemeProvider>
        </SnackbarProvider>
      </RecoilRoot>
    </Router>
  );
};
