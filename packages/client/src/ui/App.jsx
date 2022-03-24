//@ts-check
import React, { Suspense, lazy, useMemo, useState, useRef } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme, responsiveFontSizes } from "@mui/material";
import { deepPurple, indigo } from "@mui/material/colors";
import { SnackbarProvider } from "notistack";
import { RecoilRoot } from "recoil";
import { AnimatePresence, motion } from "framer-motion";
import NewsPage from "./pages/News";

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
import FadeInOut, { promisfyEvent } from "@/brand/FadeInOut";
import Navbar from "../brand/Navbar";
import { useBeforeNavigateTo, useRerender } from "@/hooks";

function MyRoutes() {
  return (
    <Suspense fallback={<FullscreenBackdropLoading />}>
      <Routes>
        <Route path="*" element={<NotFound />} />

        <Route path="/" element={<SfgTransitionOutlet fullscreen />}>
          <Route index element={<HomePage />} />
          <Route path="terms" element={<TermsAndConditionsPage />} />
          <Route path="guest" element={<GuestPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route path="/" element={<SfgTransitionOutlet showNavbar />}>
          <Route path="lobby" element={<AuthRoute element={<LobbyPage />} />} />
          <Route path="shop" element={<AccountRoute element={<ShopPage />} />} />
          <Route path="controls" element={<AuthRoute element={<ControlsPage />} />} />
          <Route path="news" element={<NewsPage />} />
        </Route>

        <Route path="/" element={<SfgTransitionOutlet hide />}>
          <Route path="games">
            <Route path=":id" element={<AuthRoute element={<PlayPage />} />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

function SfgTransitionOutlet({ fullscreen, showNavbar, hide }) {
  if (!fullscreen && !showNavbar && !hide) throw new Error("pass a prop");

  const shouldShrink = showNavbar || hide;

  const [grow, setGrow] = useState(false);
  const ref = useRef(null);
  useBeforeNavigateTo(async () => {
    const node = ref.current;
    if (!node) return;

    if (shouldShrink) {
      const grew = promisfyEvent(node, "transitionend");
      setGrow(true);
      await grew;
      requestAnimationFrame(() => setGrow(false));
    }
  });

  return (
    <>
      <ScrollingBackground ref={ref} shrink={grow ? false : shouldShrink} grow={grow} hide={hide}>
        <Suspense fallback={<FullscreenBackdropLoadingWithoutScrollingBg />}>
          {fullscreen && !grow && (
            <FadeInOut>
              <Outlet />
            </FadeInOut>
          )}

          {showNavbar && (
            <FadeInOut dontFadeBackIn>
              <Navbar />
            </FadeInOut>
          )}

          {hide && <></>}
        </Suspense>
      </ScrollingBackground>

      {!fullscreen && !grow && <Outlet />}
    </>
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
