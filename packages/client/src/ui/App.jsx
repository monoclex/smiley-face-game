//@ts-check
import React, { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import { RecoilRoot } from "recoil";

import { SnackbarUtilsConfigurator } from "../SnackbarUtils";
import FullscreenBackdropLoading from "./components/FullscreenBackdropLoading";
import { AuthRoute } from "./components/AuthRoute";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GuestPage = lazy(() => import("./pages/GuestPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LobbyPage = lazy(() => import("./pages/LobbyPage"));
const PlayPage = lazy(() => import("./pages/LoadingPage"));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditions"));
const ShopPage = lazy(() => import("./pages/ShopPage"));

export default function App() {
  const prefersDarkMode = true;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
          primary: indigo,
          secondary: deepPurple,
        },
        spacing: 8,
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <RecoilRoot>
          <SnackbarProvider maxSnack={15} autoHideDuration={1500}>
            <SnackbarUtilsConfigurator />
            <CssBaseline />
            <Suspense fallback={<FullscreenBackdropLoading />}>
              <Switch>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/terms" component={TermsAndConditionsPage} />
                <Route exact path="/guest" component={GuestPage} />
                <Route exact path="/register" component={RegisterPage} />
                <Route exact path="/login" component={LoginPage} />

                <AuthRoute exact path="/lobby" component={LobbyPage} />
                <AuthRoute exact path="/games/:id" component={PlayPage} />
                <AuthRoute needAccount exact path="/shop" component={ShopPage} />
              </Switch>
            </Suspense>
          </SnackbarProvider>
        </RecoilRoot>
      </BrowserRouter>
    </ThemeProvider>
  );
}
