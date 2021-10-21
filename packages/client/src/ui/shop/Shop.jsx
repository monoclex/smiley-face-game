import React from "react";
import { Grid } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

import { useShopItems } from "../hooks";
import ShopFeatured from "./ShopFeatured";
import FullscreenBackdropLoading from "../components/FullscreenBackdropLoading";
import ShopItem from "./ShopItem";

import Masonry from "@mui/lab/Masonry";
import MasonryItem from "@mui/lab/MasonryItem";

const Shop = () => {
  const isLarge = useMediaQuery("(min-width:900px)");
  const isHuge = useMediaQuery("(min-width:1921px)");

  // TODO:
  //  Give featured items a title bar (done, but not sure how i feel about it...)
  //  Grab shop content from API (done, but not polished)
  //  Send request to API when buying an item (done, but not polished)

  const items = useShopItems();

  if (items === undefined) return <FullscreenBackdropLoading />;
  if (items instanceof Error) return <h1>error: {items.message}</h1>;

  return (
    <Grid container>
      <Grid item container justifyContent="center">
        <Grid item style={!isLarge ? { paddingBottom: "1em" } : {}}>
          <ShopFeatured />
        </Grid>
      </Grid>

      {isLarge ? (
        <Grid container item xs={12}>
          <Grid item md={0} xl={2} />
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

export default Shop;
