//@ts-check
import React, { Suspense } from "react";
import { Grid, AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from "react-router";
import { useShopItems, useEnergy } from "../hooks";
import ShopFeatured from "./ShopFeatured";

import FullscreenBackdropLoading from "../components/FullscreenBackdropLoading";
import ShopItem from "./ShopItem";
import ErrorBoundary from "../components/ErrorBoundary";

import LogoutIcon from "../icons/LogoutIcon";
import Masonry from "@mui/lab/Masonry";
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

      <Typography variant="h5">All Items</Typography>

      {isLarge ? (
        <Grid container item xs={12}>
          <Grid item xl={2} />
          <Grid item md={12} xl={8}>
            <Masonry columns={isHuge ? 6 : 4} spacing={3} sx={{ padding: 4 }}>
              {items.map((x) => (
                // TODO: the `columnSpan` option use to be present in MasonryItem,
                //   but it seems like MasonryItem was removed and i have no idea
                //   how we should do column span anymore
                <ShopItem key={x.id} columnSpan={x.columnSpan || 1} id={x.id} />
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

export default Shop;
