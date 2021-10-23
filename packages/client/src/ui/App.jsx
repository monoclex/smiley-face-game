// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// todo fix ^

import React, { Suspense, lazy, useMemo, useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { SnackbarProvider, useSnackbar } from "notistack";
import { RecoilRoot } from "recoil";

import { SnackbarUtilsConfigurator } from "../SnackbarUtils";
import { useAuth } from "./hooks";
import Loading from "./Loading";

const AuthRoute = ({ needAccount, component: Component }) => {
  const token = localStorage.getItem("token");
  if (token === null) {
    return <Redirect to="/" />;
  }

  const decoded = JSON.parse(atob(token.split(".")[1]));
  const currentEpochSeconds = Date.now() / 1000;

  if (decoded.exp < currentEpochSeconds) {
    // token expired, kill it
    const notistack = useSnackbar();
    notistack.enqueueSnackbar("Your token has expired!", {
      variant: "error",
    });

    // don't actually remove the item in local storage here, otherwise we will
    // have different renders - do the rendering in an effect
    useEffect(() => {
      localStorage.removeItem("token");
    }, []);

    return <Redirect to="/" />;
    // return <Redirect to="/login" />;
  }

  if (needAccount) {
    const auth = useAuth();
    if (auth.isGuest) {
      const notistack = useSnackbar();

      notistack.enqueueSnackbar("You must create an account to access this!", {
        variant: "error",
      });
      return <Redirect to="/lobby" />;
    }
  }

  return <Component />;
};

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

  console.log("the theme we give to the theme provider is", theme);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <RecoilRoot>
          <SnackbarProvider maxSnack={15} autoHideDuration={1500}>
            <SnackbarUtilsConfigurator />
            <CssBaseline />
            <Suspense fallback={<Loading />}>
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
