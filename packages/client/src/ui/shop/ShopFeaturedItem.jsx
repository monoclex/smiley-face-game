import { Grid, useMediaQuery } from "@mui/material";
import React from "react";
import ShopItem from "./ShopItem";
import Masonry from "@mui/lab/Masonry";
import MasonryItem from "@mui/lab/MasonryItem";

export const ShopFeaturedItem = (item) => {
  // image =
  //   image ||
  //   "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg1.ali213.net%2Fglpic%2F2020%2F12%2F18%2F584_2020121812704639.jpg&f=1&nofb=1";

  const isLarge = useMediaQuery("(min-width:900px)");
  const isHuge = useMediaQuery("(min-width:1921px)");
  console.log(isLarge, isHuge, "s");
  const x = item;

  return (
    <Grid container>
      <Grid item>
        {isLarge ? (
          <Grid container item xs={12}>
            <Grid item md={12} xl={12}>
              {/* TODO: it's not the same size as the grid below it, but it's close enough */}
              <Grid container columns={isHuge ? 6 : 4} spacing={3} sx={{ padding: 4 }} justifyContent="center">
                <Grid item xs={4}>
                  <ShopItem isVertical={true} {...item} />
                </Grid>
              </Grid>

              {/* <Masonry columns={isHuge ? 6 : 4} spacing={3} sx={{ padding: 4 }}>
                <MasonryItem key={x.id} columnSpan={3}>
                  <ShopItem {...item} />
                </MasonryItem>
              </Masonry> */}
            </Grid>
          </Grid>
        ) : (
          <Grid container item spacing={2} xs={12} justifyContent="center">
            <Grid key={x.id} item xs={12} sm={12} justifyContent="center">
              <ShopItem isVertical={true} {...item} />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
