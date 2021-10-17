//@ts-check
import React, { Suspense, lazy, useMemo, useEffect } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { RecoilRoot } from "recoil";
import { SnackbarProvider, useSnackbar } from "notistack";
import Loading from "./Loading";
import { useHistory } from "react-router";
import { SnackbarUtilsConfigurator } from "../SnackbarUtils";
import { useAuth } from "./hooks";

const AuthRoute = ({ ...props }) => {
  function RouteInner({ ...routeProps }) {
    const history = useHistory();

    const token = localStorage.getItem("token");
    if (token === null) {
      console.log("token", token);
      // we can't perform a transition (history.push) while rendering
      useEffect(() => history.push(((() => console.log("pushing to route /"))(), "/")), []);
      return null;
    }

    const auth = useAuth();
    const notistack = useSnackbar();

    console.log("authroute props", props);
    const { needAccount } = props;
    if (needAccount === true) {
      if (auth.isGuest) {
        console.log("n", needAccount);
        // we can't perform a transition (history.push) while rendering
        useEffect(() => {
          history.push("/lobby");
          notistack.enqueueSnackbar("Cannot access this route as a guest!", {
            variant: "error",
          });
        }, []);
        return null;
      }
    }

    const Component = props.component;
    return (
      <>
        <Component {...routeProps} />
      </>
    );
  }

  return <Route {...props} component={RouteInner} />;
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
              <Route exact path="/" component={HomePage} />
              <Route exact path="/terms" component={TermsAndConditionsPage} />
              <Route exact path="/guest" component={GuestPage} />
              <Route exact path="/register" component={RegisterPage} />
              <Route exact path="/login" component={LoginPage} />
              <AuthRoute exact path="/lobby" component={LobbyPage} />
              <AuthRoute exact path="/games/:id" component={PlayPage} />
              <AuthRoute needAccount exact path="/shop" component={ShopPage} />
            </Suspense>
          </SnackbarProvider>
        </RecoilRoot>
      </BrowserRouter>
    </ThemeProvider>
  );
}
