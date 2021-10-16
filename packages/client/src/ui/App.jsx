//@ts-check
import React, { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { RecoilRoot } from "recoil";
import { SnackbarProvider } from "notistack";
import Loading from "./Loading";
import { useHistory } from "react-router";
import { SnackbarUtilsConfigurator } from "../SnackbarUtils";

const AuthRoute = ({ ...props }) => {
  const history = useHistory();

  const token = localStorage.getItem("token");
  if (token === null) {
    history.push("/");
    return null;
  }

  return <Route {...props} />;
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
              <AuthRoute exact path="/shop" component={ShopPage} />
            </Suspense>
          </SnackbarProvider>
        </RecoilRoot>
      </BrowserRouter>
    </ThemeProvider>
  );
}
