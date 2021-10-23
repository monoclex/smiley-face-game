//@ts-check
import { Suspense } from "react";
import { Grid, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useHistory } from "react-router";
import { useShopItems, useEnergy } from "../hooks";
import ShopFeatured from "./ShopFeatured";

import FullscreenBackdropLoading from "../components/FullscreenBackdropLoading";
import ShopItem from "./ShopItem";
import ErrorBoundary from "../components/ErrorBoundary";

import LogoutIcon from "../icons/LogoutIcon";
import Masonry from "@mui/lab/Masonry";
import MasonryItem from "@mui/lab/MasonryItem";
import { Box } from "@mui/system";
import EnergyIcon from "../icons/EnergyIcon";

const Shop = () => {
  const isLarge = useMediaQuery("(min-width:900px)");
  const isHuge = useMediaQuery("(min-width:1921px)");

  // TODO: Give featured items a title bar (done, but not sure how i feel about it...)

  const items = useShopItems();

  return (
    <Grid container>
      <Grid item container justifyContent="center">
        <Grid item style={!isLarge ? { paddingBottom: "1em" } : {}}>
          <ShopFeatured />
        </Grid>
      </Grid>

      {isLarge ? (
        <Grid container item xs={12}>
          <Grid item xl={2} />
          <Grid item md={12} xl={8}>
            <Masonry columns={isHuge ? 6 : 4} spacing={3} sx={{ padding: 4 }}>
              {items.map((x) => (
                <MasonryItem key={x.id} columnSpan={x.columnSpan || 1}>
                  <ShopItem id={x.id} />
                </MasonryItem>
              ))}
            </Masonry>
          </Grid>
        </Grid>
      ) : (
        <Grid container item spacing={2} xs={12}>
          {items.map((x) => (
            <Grid key={x.id} item xs={6} sm={4}>
              <ShopItem id={x.id} />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

const ShopWrapper = () => {
  const history = useHistory();
  const { energy, maxEnergy, timeLeft } = useEnergy();

  return (
    <>
      <Box sx={{ flexGrow: 1, paddingBottom: "1em" }}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }} onClick={() => history.push("/lobby")}>
              <LogoutIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Shop
            </Typography>
            <Typography variant="subtitle1" style={{ paddingRight: "1em" }}>
              {energy}/{maxEnergy}
            </Typography>
            <EnergyIcon />
            <Typography variant="caption" style={{ paddingLeft: "1em" }}>
              {timeLeft}
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <Suspense fallback={<FullscreenBackdropLoading />}>
        <ErrorBoundary>
          <Shop />
        </ErrorBoundary>
      </Suspense>
    </>
  );
};

export default ShopWrapper;
