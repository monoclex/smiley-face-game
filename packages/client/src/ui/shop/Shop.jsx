import React from "react";
import { styled, Grid, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useHistory } from "react-router";

import { useShopItems, useEnergy } from "../hooks";
import ShopFeatured from "./ShopFeatured";
import FullscreenBackdropLoading from "../components/FullscreenBackdropLoading";
import ShopItem from "./ShopItem";
import ErrorBoundary from "../components/ErrorBoundary";

import { ExitToApp, ExitToApp as ExitToAppIcon } from "mdi-material-ui";
import Masonry from "@mui/lab/Masonry";
import MasonryItem from "@mui/lab/MasonryItem";
import { Box } from "@mui/system";
import EnergyIcon from "../icons/EnergyIcon";

const RotatedIcon = styled(IconButton)({
  // https://github.com/Dogfalo/materialize/issues/3732#issuecomment-251741094
  transform: "rotate(180deg)",
});

const Shop = () => {
  const isLarge = useMediaQuery("(min-width:900px)");
  const isHuge = useMediaQuery("(min-width:1921px)");

  // TODO:
  //  Give featured items a title bar (done, but not sure how i feel about it...)
  //  Grab shop content from API (done, but not polished)
  //  Send request to API when buying an item (done, but not polished)

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
                  <ShopItem {...x} />
                </MasonryItem>
              ))}
            </Masonry>
          </Grid>
        </Grid>
      ) : (
        <Grid container item spacing={2} xs={12}>
          {items.map((x) => (
            <Grid key={x.id} item xs={6} sm={4}>
              <ShopItem {...x} />
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
            <RotatedIcon size="large" edge="start" color="inherit" sx={{ mr: 2 }} onClick={() => history.push("/lobby")}>
              <ExitToAppIcon />
            </RotatedIcon>
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
      <React.Suspense fallback={<FullscreenBackdropLoading />}>
        <ErrorBoundary>
          <Shop />
        </ErrorBoundary>
      </React.Suspense>
    </>
  );
};

export default ShopWrapper;
