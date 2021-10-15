import React, { Suspense, lazy, useMemo } from "react";
import { Router, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ThemeProvider as Muiv5ThemeProvider } from "@mui/styles";
import { CssBaseline } from "@material-ui/core";
import { deepPurple, indigo } from "@material-ui/core/colors";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import StyledEngineProvider from "@material-ui/core/StyledEngineProvider";
import Loading from "./Loading";
import history from "./history";
import { SnackbarUtilsConfigurator } from "../SnackbarUtils";

const needToken = (Component) =>
  function NeedsTokenGuard(props) {
    const token = localStorage.getItem("token");
    if (token === null) {
      history.push("/");
      return null;
    }

    return <Component {...props} token={token} />;
  };

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GuestPage = lazy(() => import("./pages/GuestPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LobbyPage = needToken(lazy(() => import("./pages/LobbyPage")));
const PlayPage = needToken(lazy(() => import("./pages/LoadingPage")));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditions"));

export default function App() {
  const prefersDarkMode = true;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: indigo,
          secondary: deepPurple,
        },
        spacing: 8,
      }),
    [prefersDarkMode]
  );

  console.log("the theme we give to the theme provider is", theme);

  return (
    <Muiv5ThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <Router history={history}>
          <RecoilRoot>
            <SnackbarProvider maxSnack={15} autoHideDuration={1500}>
              <SnackbarUtilsConfigurator />
              <StyledEngineProvider injectFirst>
                <CssBaseline />
                <Suspense fallback={<Loading />}>
                  <Route exact path="/" component={HomePage} />
                  <Route exact path="/terms" component={TermsAndConditionsPage} />
                  <Route exact path="/guest" component={GuestPage} />
                  <Route exact path="/register" component={RegisterPage} />
                  <Route exact path="/login" component={LoginPage} />
                  <Route exact path="/lobby" component={LobbyPage} />
                  <Route exact path="/games/:id" component={PlayPage} />
                </Suspense>
              </StyledEngineProvider>
            </SnackbarProvider>
          </RecoilRoot>
        </Router>
      </ThemeProvider>
    </Muiv5ThemeProvider>
  );
}
