//@ts-check
import React, { Suspense, lazy, useMemo } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import { RecoilRoot } from "recoil";
import { AnimatePresence, motion } from "framer-motion";

import { SnackbarUtilsConfigurator } from "../SnackbarUtils";
import FullscreenBackdropLoading, {
  FullscreenBackdropLoadingWithoutScrollingBg,
} from "./components/FullscreenBackdropLoading";
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
import ScrollingBackground from "@/brand/ScrollingBackground";

function MyRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<FullscreenBackdropLoading />}>
      <AnimatePresence exitBeforeEnter>
        <Routes location={location}>
          <Route path="*" element={<NotFound />} />

          <Route
            path="/"
            element={
              <>
                <ScrollingBackground>
                  <Suspense fallback={<FullscreenBackdropLoadingWithoutScrollingBg />}>
                    <motion.div
                      key={location.pathname}
                      initial="hidden"
                      animate="shown"
                      exit="hidden"
                      variants={{
                        hidden: {
                          opacity: 0,
                        },
                        shown: {
                          opacity: 1,
                        },
                      }}
                      transition={{
                        type: "spring",
                      }}
                    >
                      <Outlet />
                    </motion.div>
                  </Suspense>
                </ScrollingBackground>
              </>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="terms" element={<TermsAndConditionsPage />} />
            <Route path="guest" element={<GuestPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
          </Route>

          <Route path="/">
            <Route path="lobby" element={<AuthRoute element={<LobbyPage />} />} />
            <Route path="games">
              <Route path=":id" element={<AuthRoute element={<PlayPage />} />} />
            </Route>
            <Route path="shop" element={<AccountRoute element={<ShopPage />} />} />
            <Route path="controls" element={<AuthRoute element={<ControlsPage />} />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

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

            <MyRoutes />
          </SnackbarProvider>
        </RecoilRoot>
      </BrowserRouter>
    </ThemeProvider>
  );
}
