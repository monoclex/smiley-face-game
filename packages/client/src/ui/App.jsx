//@ts-check
import React, { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import { RecoilRoot } from "recoil";

import { SnackbarUtilsConfigurator } from "../SnackbarUtils";
import FullscreenBackdropLoading from "./components/FullscreenBackdropLoading";
import { AuthRoute, AccountRoute } from "./components/AuthRoute";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const GuestPage = lazy(() => import("./pages/GuestPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LobbyPage = lazy(() => import("./pages/LobbyPage"));
const PlayPage = lazy(() => import("./pages/PlayPage"));
const TermsAndConditionsPage = lazy(() => import("./pages/TermsAndConditions"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const ControlsPage = lazy(() => import("./pages/ControlsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

import "@/assets/fonts/dpcomic.scss";

export default function App() {
  const prefersDarkMode = true;

  const theme = useMemo(
    () =>
      responsiveFontSizes(
        createTheme({
          typography: {
            fontFamily: "DPComic",
            fontSize: 20,
          },
          palette: {
            mode: prefersDarkMode ? "dark" : "light",
            primary: indigo,
            secondary: deepPurple,
          },
          spacing: 8,
        }),
        { factor: 3 }
      ),
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
              <Routes>
                <Route path="*" element={<NotFound />} />

                <Route path="/">
                  <Route index element={<HomePage />} />
                  <Route path="terms" element={<TermsAndConditionsPage />} />
                  <Route path="guest" element={<GuestPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="lobby" element={<AuthRoute element={<LobbyPage />} />} />
                  <Route path="games">
                    <Route path=":id" element={<AuthRoute element={<PlayPage />} />} />
                  </Route>
                  <Route path="shop" element={<AccountRoute element={<ShopPage />} />} />
                  <Route path="controls" element={<AuthRoute element={<ControlsPage />} />} />
                </Route>
              </Routes>
            </Suspense>
          </SnackbarProvider>
        </RecoilRoot>
      </BrowserRouter>
    </ThemeProvider>
  );
}
